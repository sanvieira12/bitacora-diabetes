package com.gluconoche.episode;

import com.gluconoche.common.enums.EpisodeSeverity;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.person.Person;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AutomaticEpisodeServiceTest {

    private final EpisodeRepository episodeRepository = mock(EpisodeRepository.class);
    private final AutomaticEpisodeService service =
            new AutomaticEpisodeService(episodeRepository);

    @Test
    void createsEpisodeBelowSeventyUsingExistingSeverityRules() {
        NightRecord nightRecord = nightRecord(60);
        when(episodeRepository
                .existsByNightRecordIdAndEpisodeDateAndEpisodeTimeAndGlucoseAtEpisode(
                        any(), any(), any(), any()))
                .thenReturn(false);

        boolean created = service.ensureForNightRecord(
                nightRecord,
                LocalTime.of(12, 9));

        assertThat(created).isTrue();
        ArgumentCaptor<EpisodeRecord> captor = ArgumentCaptor.forClass(EpisodeRecord.class);
        verify(episodeRepository).save(captor.capture());
        EpisodeRecord episode = captor.getValue();
        assertThat(episode.getNightRecord()).isSameAs(nightRecord);
        assertThat(episode.getGlucoseAtEpisode()).isEqualTo(60);
        assertThat(episode.getEpisodeDate()).isEqualTo(nightRecord.getDate());
        assertThat(episode.getEpisodeTime()).isEqualTo(nightRecord.getMeasurementTime());
        assertThat(episode.getSeverity()).isEqualTo(EpisodeSeverity.MODERATE);
        assertThat(episode.getSymptoms()).isEmpty();
        assertThat(episode.getNotes()).isEqualTo(AutomaticEpisodeService.AUTOMATIC_NOTE);
    }

    @Test
    void doesNotCreateEpisodeAtExactlySeventy() {
        boolean created = service.ensureForNightRecord(
                nightRecord(70),
                LocalTime.NOON);

        assertThat(created).isFalse();
        verify(episodeRepository, never()).save(any());
    }

    @Test
    void doesNotCreateDuplicateEpisode() {
        NightRecord nightRecord = nightRecord(46);
        when(episodeRepository
                .existsByNightRecordIdAndEpisodeDateAndEpisodeTimeAndGlucoseAtEpisode(
                        nightRecord.getId(),
                        nightRecord.getDate(),
                        nightRecord.getBedtime(),
                        nightRecord.getGlucoseBeforeSleep()))
                .thenReturn(true);

        boolean created = service.ensureForNightRecord(
                nightRecord,
                nightRecord.getBedtime());

        assertThat(created).isFalse();
        verify(episodeRepository, never()).save(any());
    }

    private NightRecord nightRecord(int glucose) {
        Person person = new Person();
        person.setId(UUID.randomUUID());

        NightRecord nightRecord = new NightRecord();
        nightRecord.setId(UUID.randomUUID());
        nightRecord.setPerson(person);
        nightRecord.setDate(LocalDate.of(2026, 5, 19));
        nightRecord.setMeasurementTime(LocalTime.of(1, 37));
        nightRecord.setBedtime(LocalTime.of(1, 37));
        nightRecord.setGlucoseBeforeSleep(glucose);
        return nightRecord;
    }
}
