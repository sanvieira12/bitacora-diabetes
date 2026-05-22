package com.gluconoche.statistics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EpisodeFrequencyPoint {

    private String period;
    private long count;
}
