package com.gluconoche.statistics.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class GlucoseTrendPoint {

    private LocalDate date;
    private LocalTime measurementTime;
    private int glucoseBeforeSleep;
    private String attentionLevel;
}
