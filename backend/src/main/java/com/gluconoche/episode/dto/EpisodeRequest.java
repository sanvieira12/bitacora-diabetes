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

    @NotNull(message = "La fecha del episodio es obligatoria")
    private LocalDate episodeDate;

    @NotNull(message = "La hora del episodio es obligatoria")
    private LocalTime episodeTime;

    private List<String> symptoms = new ArrayList<>();

    @Min(value = 20, message = "La glucosa debe ser al menos 20 mg/dL")
    @Max(value = 600, message = "La glucosa no puede superar 600 mg/dL")
    private Integer glucoseAtEpisode;

    @NotBlank(message = "La intervención es obligatoria")
    private String intervention;

    @Min(value = 20, message = "La glucosa post-intervención debe ser al menos 20 mg/dL")
    @Max(value = 600, message = "La glucosa post-intervención no puede superar 600 mg/dL")
    private Integer glucoseAfterIntervention;

    @Min(value = 0, message = "El tiempo de recuperación no puede ser negativo")
    private Integer recoveryTimeMinutes;

    @NotNull(message = "La severidad es obligatoria")
    private EpisodeSeverity severity;

    private String notes;

    /**
     * If provided, links this episode to a specific night record.
     * If null, the service will auto-detect from episodeDate.
     */
    private UUID nightRecordId;
}
