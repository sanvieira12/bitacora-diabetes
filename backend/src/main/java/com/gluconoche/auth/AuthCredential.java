package com.gluconoche.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "auth_credential")
@Getter
@Setter
public class AuthCredential {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "pin_hash", nullable = false)
    private String pinHash;

    @Column(name = "must_change_pin", nullable = false)
    private boolean mustChangePin = true;

    @Column(name = "failed_attempts", nullable = false)
    private int failedAttempts = 0;

    @Column(name = "locked_until")
    private OffsetDateTime lockedUntil;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;
}
