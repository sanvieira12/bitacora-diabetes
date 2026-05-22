package com.gluconoche.nightrecord.dto;

import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.common.enums.SleepQuality;
import com.gluconoche.common.enums.StressLevel;
import com.gluconoche.episode.dto.EpisodeResponse;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NightRecordResponse {

    private UUID id;
    private LocalDate date;
    private Integer glucoseBeforeSleep;
    private Integer glucoseWakeup;
    private boolean hadBedtimeSnack;
    private String snackDescription;
    private LocalTime bedtime;
    private LocalTime wakeTime;
    private SleepQuality sleepQuality;
    private boolean physicalActivityToday;
    private StressLevel stressLevel;
    private String notes;
    private AttentionLevel attentionLevel;
    private List<String> attentionReasons;
    private List<EpisodeResponse> episodes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
