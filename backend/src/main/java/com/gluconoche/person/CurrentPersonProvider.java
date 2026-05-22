package com.gluconoche.person;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Provides the single person's ID for this single-user application.
 * Caches the person on startup to avoid repeated DB queries.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class CurrentPersonProvider {

    private final PersonRepository personRepository;

    private UUID personId;
    private Person person;

    @PostConstruct
    public void init() {
        var persons = personRepository.findAll();
        if (persons.isEmpty()) {
            throw new IllegalStateException(
                "No person found in database. Run Flyway migrations first (V2 seed).");
        }
        this.person = persons.get(0);
        this.personId = person.getId();
        log.info("GlucoNoche running for: {} ({})", person.getName(), personId);
    }

    public UUID getPersonId() {
        return personId;
    }

    public Person getPerson() {
        return person;
    }
}
