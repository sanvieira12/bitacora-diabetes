package com.gluconoche.settings;

import com.gluconoche.person.Person;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "app_settings")
@Getter
@Setter
public class AppSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "person_id", nullable = false)
    private Person person;

    @Column(name = "low_glucose_threshold", nullable = false)
    private int lowGlucoseThreshold = 100;

    @Column(name = "critical_glucose_threshold", nullable = false)
    private int criticalGlucoseThreshold = 70;

    @Column(name = "bedtime_target_min", nullable = false)
    private int bedtimeTargetMin = 110;

    @Column(name = "bedtime_target_max", nullable = false)
    private int bedtimeTargetMax = 180;

    @Column(name = "high_glucose_threshold", nullable = false)
    private int highGlucoseThreshold = 270;

    @Column(name = "emergency_protocol_text", nullable = false, columnDefinition = "TEXT")
    private String emergencyProtocolText = "Si glucosa < 70 mg/dL: consumir 15g hidratos simples, esperar 15 min, medir nuevamente. Llamar al médico si no mejora.";

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "last_unlocked_goal", nullable = false)
    private int lastUnlockedGoal = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
