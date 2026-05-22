package com.gluconoche.episode.dto;

import com.gluconoche.common.enums.EpisodeSeverity;
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
public class EpisodeResponse {

    private UUID id;
    private UUID nightRecordId;
    private LocalDate nightRecordDate;
    private LocalDate episodeDate;
    private LocalTime episodeTime;
    private List<String> symptoms;
    private Integer glucoseAtEpisode;
    private String intervention;
    private Integer glucoseAfterIntervention;
    private Integer recoveryTimeMinutes;
    private EpisodeSeverity severity;
    private String notes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
