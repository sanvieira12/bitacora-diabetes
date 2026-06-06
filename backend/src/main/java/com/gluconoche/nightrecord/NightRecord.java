package com.gluconoche.nightrecord;

import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.common.enums.SleepQuality;
import com.gluconoche.common.enums.StressLevel;
import com.gluconoche.person.Person;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "night_record")
@Getter
@Setter
public class NightRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "measurement_time")
    private LocalTime measurementTime;

    @Column(name = "glucose_before_sleep", nullable = false)
    private Integer glucoseBeforeSleep;

    @Column(name = "glucose_wakeup")
    private Integer glucoseWakeup;

    @Column(name = "had_bedtime_snack", nullable = false)
    private boolean hadBedtimeSnack = false;

    @Column(name = "snack_description", columnDefinition = "TEXT")
    private String snackDescription;

    @Column(name = "bedtime", nullable = false)
    private LocalTime bedtime;

    @Column(name = "wake_time")
    private LocalTime wakeTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "sleep_quality", nullable = false, length = 10)
    private SleepQuality sleepQuality;

    @Column(name = "physical_activity_today", nullable = false)
    private boolean physicalActivityToday = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "stress_level", nullable = false, length = 10)
    private StressLevel stressLevel;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "alcohol", length = 20)
    private String alcohol;

    @Column(name = "dinner_type", length = 20)
    private String dinnerType;

    @Column(name = "exercise_level", length = 20)
    private String exerciseLevel;

    @Enumerated(EnumType.STRING)
    @Column(name = "attention_level", nullable = false, length = 10)
    private AttentionLevel attentionLevel;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "attention_reasons", columnDefinition = "jsonb")
    private List<String> attentionReasons = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
