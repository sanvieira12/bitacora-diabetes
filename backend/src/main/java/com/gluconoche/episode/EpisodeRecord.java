package com.gluconoche.episode;

import com.gluconoche.common.JsonStringListConverter;
import com.gluconoche.common.enums.EpisodeSeverity;
import com.gluconoche.nightrecord.NightRecord;
import com.gluconoche.person.Person;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "episode_record")
@Getter
@Setter
public class EpisodeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "night_record_id")
    private NightRecord nightRecord;

    @Column(name = "episode_date", nullable = false)
    private LocalDate episodeDate;

    @Column(name = "episode_time", nullable = false)
    private LocalTime episodeTime;

    @Convert(converter = JsonStringListConverter.class)
    @Column(name = "symptoms", nullable = false, columnDefinition = "jsonb")
    private List<String> symptoms = new ArrayList<>();

    @Column(name = "glucose_at_episode")
    private Integer glucoseAtEpisode;

    @Column(name = "intervention", columnDefinition = "TEXT")
    private String intervention;

    @Column(name = "intervention_type", length = 20)
    private String interventionType;

    @Column(name = "intervention_note", columnDefinition = "TEXT")
    private String interventionNote;

    @Column(name = "symptoms_note", columnDefinition = "TEXT")
    private String symptomsNote;

    @Column(name = "glucose_after_intervention")
    private Integer glucoseAfterIntervention;

    @Column(name = "recovery_time_minutes")
    private Integer recoveryTimeMinutes;

    @Column(name = "recovery_time", length = 20)
    private String recoveryTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "severity", nullable = false, length = 10)
    private EpisodeSeverity severity;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
