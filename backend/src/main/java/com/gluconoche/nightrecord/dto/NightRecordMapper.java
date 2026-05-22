package com.gluconoche.nightrecord.dto;

import com.gluconoche.episode.EpisodeRecord;
import com.gluconoche.episode.dto.EpisodeMapper;
import com.gluconoche.episode.dto.EpisodeResponse;
import com.gluconoche.nightrecord.NightRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;

@Component
@RequiredArgsConstructor
public class NightRecordMapper {

    private final EpisodeMapper episodeMapper;

    public NightRecordResponse toResponse(NightRecord entity, List<EpisodeRecord> episodes) {
        if (entity == null) return null;
        List<EpisodeResponse> episodeResponses = episodes != null
                ? episodes.stream().map(episodeMapper::toResponse).toList()
                : Collections.emptyList();

        return NightRecordResponse.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .glucoseBeforeSleep(entity.getGlucoseBeforeSleep())
                .glucoseWakeup(entity.getGlucoseWakeup())
                .hadBedtimeSnack(entity.isHadBedtimeSnack())
                .snackDescription(entity.getSnackDescription())
                .bedtime(entity.getBedtime())
                .wakeTime(entity.getWakeTime())
                .sleepQuality(entity.getSleepQuality())
                .physicalActivityToday(entity.isPhysicalActivityToday())
                .stressLevel(entity.getStressLevel())
                .notes(entity.getNotes())
                .attentionLevel(entity.getAttentionLevel())
                .attentionReasons(entity.getAttentionReasons())
                .episodes(episodeResponses)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public NightRecordSummaryResponse toSummaryResponse(NightRecord entity, boolean hasEpisodes) {
        if (entity == null) return null;
        return NightRecordSummaryResponse.builder()
                .id(entity.getId())
                .date(entity.getDate())
                .glucoseBeforeSleep(entity.getGlucoseBeforeSleep())
                .attentionLevel(entity.getAttentionLevel())
                .attentionReasons(entity.getAttentionReasons())
                .hadBedtimeSnack(entity.isHadBedtimeSnack())
                .hasEpisodes(hasEpisodes)
                .sleepQuality(entity.getSleepQuality())
                .stressLevel(entity.getStressLevel())
                .notes(entity.getNotes())
                .build();
    }

    public void updateFromRequest(NightRecord entity, NightRecordRequest request) {
        entity.setDate(request.getDate());
        entity.setGlucoseBeforeSleep(request.getGlucoseBeforeSleep());
        entity.setGlucoseWakeup(request.getGlucoseWakeup());
        entity.setHadBedtimeSnack(request.isHadBedtimeSnack());
        entity.setSnackDescription(request.getSnackDescription());
        entity.setBedtime(request.getBedtime());
        entity.setWakeTime(request.getWakeTime());
        entity.setSleepQuality(request.getSleepQuality());
        entity.setPhysicalActivityToday(request.isPhysicalActivityToday());
        entity.setStressLevel(request.getStressLevel());
        entity.setNotes(request.getNotes());
    }
}
