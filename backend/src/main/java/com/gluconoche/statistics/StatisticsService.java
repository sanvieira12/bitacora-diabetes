package com.gluconoche.statistics;

import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.episode.EpisodeRecord;
import com.gluconoche.episode.EpisodeRepository;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.nightrecord.NightRecordRepository;
import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.statistics.dto.EpisodeFrequencyPoint;
import com.gluconoche.statistics.dto.FactorFrequency;
import com.gluconoche.statistics.dto.GlucoseTrendPoint;
import com.gluconoche.statistics.dto.StatisticsSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatisticsService {

    private final NightRecordRepository nightRecordRepository;
    private final EpisodeRepository episodeRepository;
    private final CurrentPersonProvider currentPersonProvider;

    @Transactional(readOnly = true)
    public StatisticsSummaryResponse getSummary(LocalDate from, LocalDate to) {
        UUID personId = currentPersonProvider.getPersonId();

        long totalNights = nightRecordRepository.countByPersonIdAndDateBetween(personId, from, to);
        long totalEpisodes = episodeRepository
                .findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateAsc(personId, from, to).size();

        Double avgGlucose = nightRecordRepository.avgGlucoseBeforeSleep(personId, from, to);
        Integer minGlucose = nightRecordRepository.minGlucoseBeforeSleep(personId, from, to);
        Integer maxGlucose = nightRecordRepository.maxGlucoseBeforeSleep(personId, from, to);

        long nightsWithEpisode = episodeRepository.countNightsWithEpisode(personId, from, to);
        double episodeRate = totalNights > 0 ? (nightsWithEpisode * 100.0 / totalNights) : 0.0;

        long nightsGreen = nightRecordRepository.countByPersonIdAndDateBetweenAndAttentionLevel(
                personId, from, to, AttentionLevel.GREEN);
        long nightsYellow = nightRecordRepository.countByPersonIdAndDateBetweenAndAttentionLevel(
                personId, from, to, AttentionLevel.YELLOW);
        long nightsRed = nightRecordRepository.countByPersonIdAndDateBetweenAndAttentionLevel(
                personId, from, to, AttentionLevel.RED);

        Double avgRecovery = episodeRepository.avgRecoveryTimeMinutes(personId, from, to);

        return StatisticsSummaryResponse.builder()
                .totalNights(totalNights)
                .totalEpisodes(totalEpisodes)
                .avgGlucoseBeforeSleep(avgGlucose != null ? Math.round(avgGlucose * 10.0) / 10.0 : 0.0)
                .minGlucoseBeforeSleep(minGlucose != null ? minGlucose : 0)
                .maxGlucoseBeforeSleep(maxGlucose != null ? maxGlucose : 0)
                .nightsWithEpisode(nightsWithEpisode)
                .episodeRate(Math.round(episodeRate * 10.0) / 10.0)
                .nightsGreen(nightsGreen)
                .nightsYellow(nightsYellow)
                .nightsRed(nightsRed)
                .avgRecoveryTimeMinutes(avgRecovery != null ? Math.round(avgRecovery * 10.0) / 10.0 : 0.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<GlucoseTrendPoint> getGlucoseTrend(LocalDate from, LocalDate to) {
        UUID personId = currentPersonProvider.getPersonId();
        List<NightRecord> records = nightRecordRepository
                .findAllByPersonIdAndDateBetweenOrderByDateAsc(personId, from, to);

        return records.stream()
                .map(r -> GlucoseTrendPoint.builder()
                        .date(r.getDate())
                        .glucoseBeforeSleep(r.getGlucoseBeforeSleep())
                        .attentionLevel(r.getAttentionLevel().name())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EpisodeFrequencyPoint> getEpisodeFrequency(LocalDate from, LocalDate to, String groupBy) {
        UUID personId = currentPersonProvider.getPersonId();
        List<EpisodeRecord> episodes = episodeRepository
                .findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateAsc(personId, from, to);

        // Group by week or month
        // TODO: groupBy='week' formats as "YYYY-'W'ww", groupBy='month' formats as "YYYY-MM".
        // Chosen week as default because it gives more granular view for glucose management.
        Map<String, Long> grouped;
        if ("month".equalsIgnoreCase(groupBy)) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
            grouped = episodes.stream()
                    .collect(Collectors.groupingBy(
                            e -> e.getEpisodeDate().format(formatter),
                            TreeMap::new,
                            Collectors.counting()));
        } else {
            // Default: week
            grouped = episodes.stream()
                    .collect(Collectors.groupingBy(
                            e -> {
                                var week = e.getEpisodeDate().get(java.time.temporal.WeekFields.ISO.weekOfWeekBasedYear());
                                var year = e.getEpisodeDate().get(java.time.temporal.WeekFields.ISO.weekBasedYear());
                                return String.format("%d-W%02d", year, week);
                            },
                            TreeMap::new,
                            Collectors.counting()));
        }

        return grouped.entrySet().stream()
                .map(entry -> EpisodeFrequencyPoint.builder()
                        .period(entry.getKey())
                        .count(entry.getValue())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<FactorFrequency> getFactors(LocalDate from, LocalDate to) {
        UUID personId = currentPersonProvider.getPersonId();
        List<NightRecord> records = nightRecordRepository
                .findAllByPersonIdAndDateBetweenOrderByDateAsc(personId, from, to);

        long total = records.size();
        if (total == 0) return Collections.emptyList();

        List<FactorFrequency> factors = new ArrayList<>();

        // Physical activity frequency
        long withActivity = records.stream().filter(NightRecord::isPhysicalActivityToday).count();
        factors.add(FactorFrequency.builder()
                .factor("Actividad física")
                .count(withActivity)
                .percentage(Math.round(withActivity * 1000.0 / total) / 10.0)
                .build());

        // Bedtime snack frequency
        long withSnack = records.stream().filter(NightRecord::isHadBedtimeSnack).count();
        factors.add(FactorFrequency.builder()
                .factor("Colación nocturna")
                .count(withSnack)
                .percentage(Math.round(withSnack * 1000.0 / total) / 10.0)
                .build());

        // High stress frequency
        long highStress = records.stream()
                .filter(r -> r.getStressLevel() == com.gluconoche.common.enums.StressLevel.HIGH)
                .count();
        factors.add(FactorFrequency.builder()
                .factor("Estrés alto")
                .count(highStress)
                .percentage(Math.round(highStress * 1000.0 / total) / 10.0)
                .build());

        // Poor sleep quality
        long poorSleep = records.stream()
                .filter(r -> r.getSleepQuality() == com.gluconoche.common.enums.SleepQuality.POOR)
                .count();
        factors.add(FactorFrequency.builder()
                .factor("Sueño malo")
                .count(poorSleep)
                .percentage(Math.round(poorSleep * 1000.0 / total) / 10.0)
                .build());

        return factors;
    }
}
