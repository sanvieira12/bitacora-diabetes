package com.gluconoche.settings.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SettingsRequest {

    @NotNull
    @Min(40) @Max(200)
    private Integer lowGlucoseThreshold;

    @NotNull
    @Min(40) @Max(150)
    private Integer criticalGlucoseThreshold;

    @NotNull
    @Min(60) @Max(250)
    private Integer bedtimeTargetMin;

    @NotNull
    @Min(80) @Max(400)
    private Integer bedtimeTargetMax;

    @NotNull
    @Min(150) @Max(500)
    private Integer highGlucoseThreshold;

    @NotBlank
    private String emergencyProtocolText;

    private String doctorNotes;
}
