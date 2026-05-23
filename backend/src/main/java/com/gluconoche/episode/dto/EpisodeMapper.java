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
                .symptomsNote(entity.getSymptomsNote())
                .glucoseAtEpisode(entity.getGlucoseAtEpisode())
                .intervention(entity.getIntervention())
                .interventionType(entity.getInterventionType())
                .interventionNote(entity.getInterventionNote())
                .glucoseAfterIntervention(entity.getGlucoseAfterIntervention())
                .recoveryTimeMinutes(entity.getRecoveryTimeMinutes())
                .recoveryTime(entity.getRecoveryTime())
                .severity(entity.getSeverity())
                .notes(entity.getNotes())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public void updateFromRequest(EpisodeRecord entity, EpisodeRequest request) {
        if (request.getEpisodeDate() != null) {
            entity.setEpisodeDate(request.getEpisodeDate());
        }
        entity.setEpisodeTime(request.getEpisodeTime());
        entity.setSymptoms(request.getSymptoms() != null ? request.getSymptoms() : new java.util.ArrayList<>());
        entity.setSymptomsNote(request.getSymptomsNote());
        entity.setGlucoseAtEpisode(request.getGlucoseAtEpisode());
        entity.setIntervention(request.getIntervention());
        entity.setInterventionType(request.getInterventionType());
        entity.setInterventionNote(request.getInterventionNote());
        entity.setGlucoseAfterIntervention(request.getGlucoseAfterIntervention());
        entity.setRecoveryTimeMinutes(request.getRecoveryTimeMinutes());
        entity.setRecoveryTime(request.getRecoveryTime());
        entity.setSeverity(request.getSeverity());
        entity.setNotes(request.getNotes());
    }
}
