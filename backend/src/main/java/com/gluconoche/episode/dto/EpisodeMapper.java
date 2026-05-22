package com.gluconoche.episode.dto;

import com.gluconoche.episode.EpisodeRecord;
import org.springframework.stereotype.Component;

@Component
public class EpisodeMapper {

    public EpisodeResponse toResponse(EpisodeRecord entity) {
        if (entity == null) return null;
        return EpisodeResponse.builder()
                .id(entity.getId())
                .nightRecordId(entity.getNightRecord() != null ? entity.getNightRecord().getId() : null)
                .nightRecordDate(entity.getNightRecord() != null ? entity.getNightRecord().getDate() : null)
                .episodeDate(entity.getEpisodeDate())
                .episodeTime(entity.getEpisodeTime())
                .symptoms(entity.getSymptoms())
                .glucoseAtEpisode(entity.getGlucoseAtEpisode())
                .intervention(entity.getIntervention())
                .glucoseAfterIntervention(entity.getGlucoseAfterIntervention())
                .recoveryTimeMinutes(entity.getRecoveryTimeMinutes())
                .severity(entity.getSeverity())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateFromRequest(EpisodeRecord entity, EpisodeRequest request) {
        entity.setEpisodeDate(request.getEpisodeDate());
        entity.setEpisodeTime(request.getEpisodeTime());
        entity.setSymptoms(request.getSymptoms() != null ? request.getSymptoms() : new java.util.ArrayList<>());
        entity.setGlucoseAtEpisode(request.getGlucoseAtEpisode());
        entity.setIntervention(request.getIntervention());
        entity.setGlucoseAfterIntervention(request.getGlucoseAfterIntervention());
        entity.setRecoveryTimeMinutes(request.getRecoveryTimeMinutes());
        entity.setSeverity(request.getSeverity());
        entity.setNotes(request.getNotes());
    }
}
