package com.gluconoche.settings.dto;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class SettingsResponse {
    private UUID id;
    private int lowGlucoseThreshold;
    private int criticalGlucoseThreshold;
    private int bedtimeTargetMin;
    private int bedtimeTargetMax;
    private int highGlucoseThreshold;
    private String emergencyProtocolText;
    private String doctorNotes;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
