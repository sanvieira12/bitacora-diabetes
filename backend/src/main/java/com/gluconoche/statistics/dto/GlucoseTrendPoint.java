package com.gluconoche.statistics.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;

@Data
@Builder
public class GlucoseTrendPoint {

    private LocalDate date;
    private int glucoseBeforeSleep;
    private String attentionLevel;
}
