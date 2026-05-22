package com.gluconoche.statistics;

import com.gluconoche.common.ApiResponse;
import com.gluconoche.statistics.dto.EpisodeFrequencyPoint;
import com.gluconoche.statistics.dto.FactorFrequency;
import com.gluconoche.statistics.dto.GlucoseTrendPoint;
import com.gluconoche.statistics.dto.StatisticsSummaryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/statistics")
@RequiredArgsConstructor
public class StatisticsController {

    private final StatisticsService statisticsService;

    @GetMapping("/summary")
    public ApiResponse<StatisticsSummaryResponse> getSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(30);
        return ApiResponse.ok(statisticsService.getSummary(effectiveFrom, effectiveTo));
    }

    @GetMapping("/glucose-trend")
    public ApiResponse<List<GlucoseTrendPoint>> getGlucoseTrend(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(30);
        return ApiResponse.ok(statisticsService.getGlucoseTrend(effectiveFrom, effectiveTo));
    }

    @GetMapping("/episode-frequency")
    public ApiResponse<List<EpisodeFrequencyPoint>> getEpisodeFrequency(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "week") String groupBy) {

        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(30);
        return ApiResponse.ok(statisticsService.getEpisodeFrequency(effectiveFrom, effectiveTo, groupBy));
    }

    @GetMapping("/factors")
    public ApiResponse<List<FactorFrequency>> getFactors(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(30);
        return ApiResponse.ok(statisticsService.getFactors(effectiveFrom, effectiveTo));
    }
}
