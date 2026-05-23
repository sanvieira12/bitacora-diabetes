package com.gluconoche.episode.dto;

import com.gluconoche.common.enums.EpisodeSeverity;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
public class EpisodeRequest {

    // Not required from frontend on create — set to Uruguay local date by service.
    // Kept for edit mode.
    private LocalDate episodeDate;

    @NotNull(message = "La hora del episodio es obligatoria")
    private LocalTime episodeTime;

    private List<String> symptoms = new ArrayList<>();

    private String symptomsNote;

    @Min(value = 10, message = "La glucosa debe ser al menos 10 mg/dL")
    @Max(value = 300, message = "La glucosa no puede superar 300 mg/dL")
    private Integer glucoseAtEpisode;

    // Legacy free-text intervention (kept for backward compat)
    private String intervention;

    // New structured intervention
    private String interventionType;

    private String interventionNote;

    @Min(value = 10, message = "La glucosa post debe ser al menos 10 mg/dL")
    @Max(value = 400, message = "La glucosa post no puede superar 400 mg/dL")
    private Integer glucoseAfterIntervention;

    @Min(value = 0, message = "El tiempo de recuperación no puede ser negativo")
    private Integer recoveryTimeMinutes;

    // Snapped recovery enum: FAST | NORMAL | SLOW | VERY_SLOW
    private String recoveryTime;

    @NotNull(message = "La severidad es obligatoria")
    private EpisodeSeverity severity;

    private String notes;

    private UUID nightRecordId;
}
