package com.gluconoche.admin.importer;

import com.gluconoche.episode.AutomaticEpisodeService;
import com.gluconoche.episode.EpisodeRecord;
import com.gluconoche.episode.EpisodeRepository;
import com.gluconoche.nightrecord.AttentionLevelCalculator;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.nightrecord.NightRecordRepository;
import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.person.Person;
import com.gluconoche.settings.AppSettings;
import com.gluconoche.settings.SettingsService;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class GlucoseExcelImportServiceTest {

    @Test
    void importsWorkbookAndIsIdempotent() throws IOException {
        UUID personId = UUID.randomUUID();
        Person person = new Person();
        person.setId(personId);
        person.setName("Juana");

        Map<String, NightRecord> recordsByMeasurement = new HashMap<>();
        NightRecordRepository nightRecordRepository = mock(NightRecordRepository.class);
        when(nightRecordRepository
                .findByPersonIdAndDateAndMeasurementTimeAndGlucoseBeforeSleep(
                        any(), any(), any(), any()))
                .thenAnswer(invocation -> Optional.ofNullable(
                        recordsByMeasurement.get(measurementKey(
                                invocation.getArgument(1),
                                invocation.getArgument(2),
                                invocation.getArgument(3)))));
        when(nightRecordRepository
                .findByPersonIdAndDateAndMeasurementTimeIsNullAndGlucoseBeforeSleepAndNotes(
                        any(), any(), any(), any()))
                .thenReturn(Optional.empty());
        when(nightRecordRepository.save(any(NightRecord.class)))
                .thenAnswer(invocation -> {
                    NightRecord record = invocation.getArgument(0);
                    if (record.getId() == null) {
                        record.setId(UUID.randomUUID());
                    }
                    recordsByMeasurement.put(measurementKey(
                            record.getDate(),
                            record.getMeasurementTime(),
                            record.getGlucoseBeforeSleep()), record);
                    return record;
                });

        Set<String> automaticEpisodeKeys = new HashSet<>();
        EpisodeRepository episodeRepository = mock(EpisodeRepository.class);
        when(episodeRepository
                .existsByNightRecordIdAndEpisodeDateAndEpisodeTimeAndGlucoseAtEpisode(
                        any(), any(), any(), any()))
                .thenAnswer(invocation -> automaticEpisodeKeys.contains(key(
                        invocation.getArgument(0),
                        invocation.getArgument(1),
                        invocation.getArgument(2),
                        invocation.getArgument(3))));
        when(episodeRepository.save(any(EpisodeRecord.class)))
                .thenAnswer(invocation -> {
                    EpisodeRecord episode = invocation.getArgument(0);
                    automaticEpisodeKeys.add(key(
                            episode.getNightRecord().getId(),
                            episode.getEpisodeDate(),
                            episode.getEpisodeTime(),
                            episode.getGlucoseAtEpisode()));
                    return episode;
                });

        CurrentPersonProvider currentPersonProvider = mock(CurrentPersonProvider.class);
        when(currentPersonProvider.getPersonId()).thenReturn(personId);
        when(currentPersonProvider.getPerson()).thenReturn(person);

        SettingsService settingsService = mock(SettingsService.class);
        when(settingsService.findSettings()).thenReturn(new AppSettings());

        GlucoseExcelImportService service = new GlucoseExcelImportService(
                new GlucoseExcelParser(),
                nightRecordRepository,
                currentPersonProvider,
                settingsService,
                new AttentionLevelCalculator(),
                new AutomaticEpisodeService(episodeRepository));

        GlucoseImportSummary firstImport = importWorkbook(service);
        assertThat(firstImport.errors()).isEmpty();
        assertThat(firstImport.importedNightRecords()).isEqualTo(75);
        assertThat(firstImport.skippedDuplicates()).isZero();
        assertThat(firstImport.createdEpisodes()).isEqualTo(10);
        assertThat(recordsByMeasurement).hasSize(75);
        assertThat(automaticEpisodeKeys).hasSize(10);

        GlucoseImportSummary secondImport = importWorkbook(service);
        assertThat(secondImport.errors()).isEmpty();
        assertThat(secondImport.importedNightRecords()).isZero();
        assertThat(secondImport.skippedDuplicates()).isEqualTo(75);
        assertThat(secondImport.createdEpisodes()).isZero();
        assertThat(recordsByMeasurement).hasSize(75);
        assertThat(automaticEpisodeKeys).hasSize(10);
    }

    private GlucoseImportSummary importWorkbook(
            GlucoseExcelImportService service) throws IOException {
        try (var inputStream = Files.newInputStream(
                Path.of("imports", "Glucemias_2026_Ordenadas.xlsx"))) {
            return service.importWorkbook(inputStream);
        }
    }

    private String key(Object nightRecordId, Object date, Object time, Object glucose) {
        return nightRecordId + "|" + date + "|" + time + "|" + glucose;
    }

    private String measurementKey(LocalDate date, LocalTime time, Integer glucose) {
        return date + "|" + time + "|" + glucose;
    }
}
