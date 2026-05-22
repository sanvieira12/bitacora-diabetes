package com.gluconoche.settings.dto;

import com.gluconoche.settings.AppSettings;
import org.springframework.stereotype.Component;

@Component
public class SettingsMapper {

    public SettingsResponse toResponse(AppSettings settings) {
        return SettingsResponse.builder()
                .id(settings.getId())
                .lowGlucoseThreshold(settings.getLowGlucoseThreshold())
                .criticalGlucoseThreshold(settings.getCriticalGlucoseThreshold())
                .bedtimeTargetMin(settings.getBedtimeTargetMin())
                .bedtimeTargetMax(settings.getBedtimeTargetMax())
                .highGlucoseThreshold(settings.getHighGlucoseThreshold())
                .emergencyProtocolText(settings.getEmergencyProtocolText())
                .doctorNotes(settings.getDoctorNotes())
                .createdAt(settings.getCreatedAt())
                .updatedAt(settings.getUpdatedAt())
                .build();
    }

    public void updateFromRequest(AppSettings settings, SettingsRequest request) {
        settings.setLowGlucoseThreshold(request.getLowGlucoseThreshold());
        settings.setCriticalGlucoseThreshold(request.getCriticalGlucoseThreshold());
        settings.setBedtimeTargetMin(request.getBedtimeTargetMin());
        settings.setBedtimeTargetMax(request.getBedtimeTargetMax());
        settings.setHighGlucoseThreshold(request.getHighGlucoseThreshold());
        settings.setEmergencyProtocolText(request.getEmergencyProtocolText());
        settings.setDoctorNotes(request.getDoctorNotes());
    }
}
