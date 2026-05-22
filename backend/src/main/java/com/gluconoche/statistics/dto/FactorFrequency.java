package com.gluconoche.statistics.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FactorFrequency {

    private String factor;
    private long count;
    private double percentage;
}
