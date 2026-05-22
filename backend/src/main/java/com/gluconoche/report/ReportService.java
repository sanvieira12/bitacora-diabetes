package com.gluconoche.report;

import com.gluconoche.episode.EpisodeRecord;
import com.gluconoche.episode.EpisodeRepository;
import com.gluconoche.episode.dto.EpisodeMapper;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.nightrecord.NightRecordRepository;
import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.report.dto.DoctorSummaryResponse;
import com.gluconoche.settings.AppSettings;
import com.gluconoche.settings.SettingsService;
import com.gluconoche.statistics.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportService {

    private static final String DISCLAIMER =
            "Esta información es orientativa y no reemplaza el criterio clínico de su médico.";

    private final StatisticsService statisticsService;
    private final NightRecordRepository nightRecordRepository;
    private final EpisodeRepository episodeRepository;
    private final PdfReportGenerator pdfReportGenerator;
    private final CsvReportGenerator csvReportGenerator;
    private final SettingsService settingsService;
    private final CurrentPersonProvider currentPersonProvider;
    private final EpisodeMapper episodeMapper;

    @Transactional(readOnly = true)
    public DoctorSummaryResponse buildDoctorSummary(LocalDate from, LocalDate to) {
        UUID personId = currentPersonProvider.getPersonId();
        AppSettings settings = settingsService.findSettings();

        List<EpisodeRecord> episodes = episodeRepository
                .findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateAsc(personId, from, to);

        return DoctorSummaryResponse.builder()
                .personName(currentPersonProvider.getPerson().getName())
                .from(from)
                .to(to)
                .generatedAt(OffsetDateTime.now())
                .statistics(statisticsService.getSummary(from, to))
                .glucoseTrend(statisticsService.getGlucoseTrend(from, to))
                .episodes(episodes.stream().map(episodeMapper::toResponse).toList())
                .emergencyProtocolText(settings.getEmergencyProtocolText())
                .doctorNotes(settings.getDoctorNotes())
                .disclaimer(DISCLAIMER)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(LocalDate from, LocalDate to) {
        return pdfReportGenerator.generate(buildDoctorSummary(from, to));
    }

    @Transactional(readOnly = true)
    public byte[] generateCsv(LocalDate from, LocalDate to) {
        UUID personId = currentPersonProvider.getPersonId();
        List<NightRecord> nights = nightRecordRepository
                .findAllByPersonIdAndDateBetweenOrderByDateAsc(personId, from, to);
        List<EpisodeRecord> episodes = episodeRepository
                .findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateAsc(personId, from, to);
        return csvReportGenerator.generateZip(from, to, nights, episodes);
    }
}
