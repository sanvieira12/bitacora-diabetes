package com.gluconoche.episode;

import com.gluconoche.common.ApiResponse;
import com.gluconoche.episode.dto.EpisodeMapper;
import com.gluconoche.episode.dto.EpisodeRequest;
import com.gluconoche.episode.dto.EpisodeResponse;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.nightrecord.NightRecordRepository;
import com.gluconoche.nightrecord.NightRecordService;
import com.gluconoche.person.CurrentPersonProvider;
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
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EpisodeService {

    private final EpisodeRepository episodeRepository;
    private final NightRecordRepository nightRecordRepository;
    private final EpisodeMapper episodeMapper;
    private final CurrentPersonProvider currentPersonProvider;

    @Transactional(readOnly = true)
    public Page<EpisodeResponse> findAll(LocalDate from, LocalDate to, Pageable pageable) {
        UUID personId = currentPersonProvider.getPersonId();
        return episodeRepository
                .findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateDesc(personId, from, to, pageable)
                .map(episodeMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public EpisodeResponse findById(UUID id) {
        return episodeMapper.toResponse(findEpisode(id));
    }

    @Transactional
    public EpisodeResponse create(EpisodeRequest request) {
        UUID personId = currentPersonProvider.getPersonId();

        // Always use Uruguay local date for new episodes
        request.setEpisodeDate(ZonedDateTime.now(ZoneId.of("America/Montevideo")).toLocalDate());

        EpisodeRecord episode = new EpisodeRecord();
        episode.setPerson(currentPersonProvider.getPerson());
        episodeMapper.updateFromRequest(episode, request);

        // Link to night record
        linkToNightRecord(episode, request, personId);

        return episodeMapper.toResponse(episodeRepository.save(episode));
    }

    @Transactional
    public EpisodeResponse update(UUID id, EpisodeRequest request) {
        EpisodeRecord episode = findEpisode(id);
        episodeMapper.updateFromRequest(episode, request);

        // Re-link if night record changed
        UUID personId = currentPersonProvider.getPersonId();
        linkToNightRecord(episode, request, personId);

        return episodeMapper.toResponse(episodeRepository.save(episode));
    }

    @Transactional
    public void delete(UUID id) {
        EpisodeRecord episode = findEpisode(id);
        episodeRepository.delete(episode);
    }

    private void linkToNightRecord(EpisodeRecord episode, EpisodeRequest request, UUID personId) {
        if (request.getNightRecordId() != null) {
            // Explicit link provided
            NightRecord nightRecord = nightRecordRepository.findById(request.getNightRecordId())
                    .orElseThrow(() -> new EntityNotFoundException(
                        "Registro nocturno no encontrado: " + request.getNightRecordId()));
            episode.setNightRecord(nightRecord);
        } else {
            // Auto-detect from episode date
            Optional<NightRecord> nightRecord = nightRecordRepository
                    .findFirstByPersonIdAndDateOrderByMeasurementTimeDescCreatedAtDesc(
                            personId,
                            request.getEpisodeDate());
            nightRecord.ifPresent(episode::setNightRecord);
        }
    }

    private EpisodeRecord findEpisode(UUID id) {
        return episodeRepository.findById(id)
                .filter(e -> e.getPerson().getId().equals(currentPersonProvider.getPersonId()))
                .orElseThrow(() -> new EntityNotFoundException("Episodio no encontrado: " + id));
    }

    public static ApiResponse.PageMeta buildPageMeta(Page<?> page) {
        return NightRecordService.buildPageMeta(page);
    }
}
