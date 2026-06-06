package com.gluconoche.nightrecord;

import com.gluconoche.common.ApiResponse;
import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.episode.AutomaticEpisodeService;
import com.gluconoche.episode.EpisodeRecord;
import com.gluconoche.episode.EpisodeRepository;
import com.gluconoche.nightrecord.dto.NightRecordMapper;
import com.gluconoche.nightrecord.dto.NightRecordRequest;
import com.gluconoche.nightrecord.dto.NightRecordResponse;
import com.gluconoche.nightrecord.dto.NightRecordSummaryResponse;
import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.settings.AppSettings;
import com.gluconoche.settings.SettingsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NightRecordService {

    private final NightRecordRepository nightRecordRepository;
    private final EpisodeRepository episodeRepository;
    private final AttentionLevelCalculator attentionLevelCalculator;
    private final SettingsService settingsService;
    private final CurrentPersonProvider currentPersonProvider;
    private final NightRecordMapper nightRecordMapper;
    private final AutomaticEpisodeService automaticEpisodeService;

    @Transactional(readOnly = true)
    public Page<NightRecordSummaryResponse> findAll(
            LocalDate from, LocalDate to,
            Boolean hasEpisode, AttentionLevel attentionLevel,
            Pageable pageable) {

        UUID personId = currentPersonProvider.getPersonId();
        Page<NightRecord> page = nightRecordRepository.findWithFilters(
                personId, from, to, attentionLevel, hasEpisode, pageable);

        return page.map(record -> {
            boolean hasEpisodes = !episodeRepository.findByNightRecordId(record.getId()).isEmpty();
            return nightRecordMapper.toSummaryResponse(record, hasEpisodes);
        });
    }

    @Transactional(readOnly = true)
    public NightRecordResponse findById(UUID id) {
        NightRecord record = findRecord(id);
        List<EpisodeRecord> episodes = episodeRepository.findByNightRecordId(id);
        return nightRecordMapper.toResponse(record, episodes);
    }

    @Transactional
    public NightRecordResponse create(NightRecordRequest request) {
        UUID personId = currentPersonProvider.getPersonId();

        // Always use Uruguay local date for new records
        LocalDate uruguayDate = ZonedDateTime.now(ZoneId.of("America/Montevideo")).toLocalDate();
        request.setDate(uruguayDate);

        NightRecord record = new NightRecord();
        record.setPerson(currentPersonProvider.getPerson());
        nightRecordMapper.updateFromRequest(record, request);
        if (record.getMeasurementTime() == null) {
            record.setMeasurementTime(record.getBedtime());
        }
        ensureUniqueMeasurement(record, null);
        recalculateAttentionLevel(record);

        NightRecord saved = nightRecordRepository.save(record);
        automaticEpisodeService.ensureForNightRecord(saved, saved.getBedtime());
        List<EpisodeRecord> episodes = episodeRepository.findByNightRecordId(saved.getId());
        return nightRecordMapper.toResponse(saved, episodes);
    }

    @Transactional
    public NightRecordResponse update(UUID id, NightRecordRequest request) {
        NightRecord record = findRecord(id);
        nightRecordMapper.updateFromRequest(record, request);
        if (record.getMeasurementTime() == null) {
            record.setMeasurementTime(record.getBedtime());
        }
        ensureUniqueMeasurement(record, id);
        recalculateAttentionLevel(record);

        NightRecord saved = nightRecordRepository.save(record);
        automaticEpisodeService.ensureForNightRecord(saved, saved.getBedtime());
        List<EpisodeRecord> episodes = episodeRepository.findByNightRecordId(saved.getId());
        return nightRecordMapper.toResponse(saved, episodes);
    }

    @Transactional
    public void delete(UUID id) {
        NightRecord record = findRecord(id);
        nightRecordRepository.delete(record);
    }

    private NightRecord findRecord(UUID id) {
        return nightRecordRepository.findById(id)
                .filter(r -> r.getPerson().getId().equals(currentPersonProvider.getPersonId()))
                .orElseThrow(() -> new EntityNotFoundException("Registro nocturno no encontrado: " + id));
    }

    private void recalculateAttentionLevel(NightRecord record) {
        AppSettings settings = settingsService.findSettings();
        AttentionLevelCalculator.AttentionResult result = attentionLevelCalculator.calculate(record, settings);
        record.setAttentionLevel(result.level());
        record.setAttentionReasons(result.reasons());
    }

    private void ensureUniqueMeasurement(NightRecord record, UUID existingId) {
        UUID personId = record.getPerson().getId();
        boolean duplicate = existingId == null
                ? nightRecordRepository
                        .findByPersonIdAndDateAndMeasurementTimeAndGlucoseBeforeSleep(
                                personId,
                                record.getDate(),
                                record.getMeasurementTime(),
                                record.getGlucoseBeforeSleep())
                        .isPresent()
                : nightRecordRepository
                        .existsByPersonIdAndDateAndMeasurementTimeAndGlucoseBeforeSleepAndIdNot(
                                personId,
                                record.getDate(),
                                record.getMeasurementTime(),
                                record.getGlucoseBeforeSleep(),
                                existingId);
        if (duplicate) {
            throw new IllegalArgumentException(
                    "Ya existe una medición con la misma fecha, hora y glucosa.");
        }
    }

    /**
     * Build ApiResponse.PageMeta from a Spring Page.
     */
    public static ApiResponse.PageMeta buildPageMeta(Page<?> page) {
        return ApiResponse.PageMeta.builder()
                .page(page.getNumber())
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .last(page.isLast())
                .build();
    }
}
