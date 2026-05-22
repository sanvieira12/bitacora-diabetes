package com.gluconoche.nightrecord.dto;

import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.common.enums.SleepQuality;
import com.gluconoche.common.enums.StressLevel;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NightRecordSummaryResponse {

    private UUID id;
    private LocalDate date;
    private Integer glucoseBeforeSleep;
    private AttentionLevel attentionLevel;
    private List<String> attentionReasons;
    private boolean hadBedtimeSnack;
    private boolean hasEpisodes;
    private SleepQuality sleepQuality;
    private StressLevel stressLevel;
    private String notes;
}
