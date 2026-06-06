package com.gluconoche.episode;

import com.gluconoche.common.enums.EpisodeSeverity;
import com.gluconoche.nightrecord.NightRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class AutomaticEpisodeService {

    static final int HYPOGLYCEMIA_THRESHOLD = 70;
    static final int SEVERE_THRESHOLD = 54;
    static final String AUTOMATIC_NOTE =
            "Episode automatically created because the registered glucose was below 70 mg/dL.";

    private final EpisodeRepository episodeRepository;

    public boolean ensureForNightRecord(NightRecord nightRecord, LocalTime episodeTime) {
        Integer glucose = nightRecord.getGlucoseBeforeSleep();
        if (glucose == null || glucose >= HYPOGLYCEMIA_THRESHOLD) {
            return false;
        }

        LocalTime effectiveTime = nightRecord.getMeasurementTime() != null
                ? nightRecord.getMeasurementTime()
                : episodeTime != null
                ? episodeTime
                // Night records currently require bedtime; midnight is only a legacy-data fallback.
                : LocalTime.MIDNIGHT;

        boolean exists = episodeRepository
                .existsByNightRecordIdAndEpisodeDateAndEpisodeTimeAndGlucoseAtEpisode(
                        nightRecord.getId(),
                        nightRecord.getDate(),
                        effectiveTime,
                        glucose);
        if (exists) {
            return false;
        }

        EpisodeRecord episode = new EpisodeRecord();
        episode.setPerson(nightRecord.getPerson());
        episode.setNightRecord(nightRecord);
        episode.setEpisodeDate(nightRecord.getDate());
        episode.setEpisodeTime(effectiveTime);
        episode.setSymptoms(new ArrayList<>());
        episode.setGlucoseAtEpisode(glucose);
        episode.setSeverity(glucose < SEVERE_THRESHOLD
                ? EpisodeSeverity.SEVERE
                : EpisodeSeverity.MODERATE);
        episode.setNotes(AUTOMATIC_NOTE);
        episodeRepository.save(episode);
        return true;
    }
}
