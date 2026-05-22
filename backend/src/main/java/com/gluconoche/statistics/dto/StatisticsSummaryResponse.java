package com.gluconoche.statistics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class StatisticsSummaryResponse {

    private long totalNights;
    private long totalEpisodes;
    private double avgGlucoseBeforeSleep;
    private int minGlucoseBeforeSleep;
    private int maxGlucoseBeforeSleep;
    private long nightsWithEpisode;
    private double episodeRate;
    private long nightsGreen;
    private long nightsYellow;
    private long nightsRed;
    private double avgRecoveryTimeMinutes;
}
