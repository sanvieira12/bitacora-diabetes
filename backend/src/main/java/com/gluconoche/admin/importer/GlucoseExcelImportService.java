package com.gluconoche.admin.importer;

import com.gluconoche.common.enums.SleepQuality;
import com.gluconoche.common.enums.StressLevel;
import com.gluconoche.episode.AutomaticEpisodeService;
import com.gluconoche.nightrecord.AttentionLevelCalculator;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.nightrecord.NightRecordRepository;
import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.settings.AppSettings;
import com.gluconoche.settings.SettingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GlucoseExcelImportService {

    private static final String IMPORT_NOTE =
            "Imported from historical Excel 2026. Measurement time: %s.";

    private final GlucoseExcelParser glucoseExcelParser;
    private final NightRecordRepository nightRecordRepository;
    private final CurrentPersonProvider currentPersonProvider;
    private final SettingsService settingsService;
    private final AttentionLevelCalculator attentionLevelCalculator;
    private final AutomaticEpisodeService automaticEpisodeService;

    @Transactional
    public GlucoseImportSummary importWorkbook(InputStream inputStream) {
        GlucoseExcelParseResult parsed = glucoseExcelParser.parse(inputStream);
        AppSettings settings = settingsService.findSettings();
        int importedNightRecords = 0;
        int skippedDuplicates = 0;
        int createdEpisodes = 0;
        List<String> errors = new ArrayList<>(parsed.errors());

        for (GlucoseExcelRow row : parsed.rows()) {
            String importNote = IMPORT_NOTE.formatted(row.time());
            var existing = nightRecordRepository
                    .findByPersonIdAndDateAndMeasurementTimeAndGlucoseBeforeSleep(
                    currentPersonProvider.getPersonId(),
                    row.date(),
                    row.time(),
                    row.glucose());
            if (existing.isEmpty()) {
                existing = nightRecordRepository
                        .findByPersonIdAndDateAndMeasurementTimeIsNullAndGlucoseBeforeSleepAndNotes(
                                currentPersonProvider.getPersonId(),
                                row.date(),
                                row.glucose(),
                                importNote);
                existing.ifPresent(record -> {
                    record.setMeasurementTime(row.time());
                    nightRecordRepository.save(record);
                });
            }
            if (existing.isPresent()) {
                skippedDuplicates++;
                if (automaticEpisodeService.ensureForNightRecord(
                        existing.get(),
                        existing.get().getBedtime())) {
                    createdEpisodes++;
                }
                continue;
            }

            NightRecord nightRecord = new NightRecord();
            nightRecord.setPerson(currentPersonProvider.getPerson());
            nightRecord.setDate(row.date());
            nightRecord.setMeasurementTime(row.time());
            nightRecord.setGlucoseBeforeSleep(row.glucose());
            nightRecord.setBedtime(row.time());
            nightRecord.setSleepQuality(SleepQuality.UNKNOWN);
            nightRecord.setStressLevel(StressLevel.UNKNOWN);
            nightRecord.setNotes(importNote);

            AttentionLevelCalculator.AttentionResult attention =
                    attentionLevelCalculator.calculate(nightRecord, settings);
            nightRecord.setAttentionLevel(attention.level());
            nightRecord.setAttentionReasons(attention.reasons());

            NightRecord saved = nightRecordRepository.save(nightRecord);
            importedNightRecords++;
            if (automaticEpisodeService.ensureForNightRecord(saved, row.time())) {
                createdEpisodes++;
            }
        }

        return new GlucoseImportSummary(
                importedNightRecords,
                skippedDuplicates,
                createdEpisodes,
                List.copyOf(errors));
    }
}
