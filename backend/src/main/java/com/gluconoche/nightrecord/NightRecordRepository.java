package com.gluconoche.nightrecord;

import com.gluconoche.common.enums.AttentionLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NightRecordRepository extends JpaRepository<NightRecord, UUID> {

    Page<NightRecord> findAllByPersonIdAndDateBetweenOrderByDateDescMeasurementTimeDesc(
            UUID personId, LocalDate from, LocalDate to, Pageable pageable);

    Optional<NightRecord> findFirstByPersonIdAndDateOrderByMeasurementTimeDescCreatedAtDesc(
            UUID personId,
            LocalDate date);

    Optional<NightRecord> findByPersonIdAndDateAndMeasurementTimeAndGlucoseBeforeSleep(
            UUID personId,
            LocalDate date,
            LocalTime measurementTime,
            Integer glucoseBeforeSleep);

    Optional<NightRecord> findByPersonIdAndDateAndMeasurementTimeIsNullAndGlucoseBeforeSleepAndNotes(
            UUID personId,
            LocalDate date,
            Integer glucoseBeforeSleep,
            String notes);

    boolean existsByPersonIdAndDateAndMeasurementTimeAndGlucoseBeforeSleepAndIdNot(
            UUID personId,
            LocalDate date,
            LocalTime measurementTime,
            Integer glucoseBeforeSleep,
            UUID id);

    long countByPersonId(UUID personId);

    List<NightRecord> findAllByPersonIdAndDateBetweenOrderByDateAscMeasurementTimeAsc(
            UUID personId, LocalDate from, LocalDate to);

    /**
     * Filters night records by attention level, optionally only those with linked episodes.
     */
    @Query("""
            SELECT nr FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
              AND (:attentionLevel IS NULL OR nr.attentionLevel = :attentionLevel)
              AND (:hasEpisode IS NULL OR
                   (:hasEpisode = TRUE AND EXISTS (
                       SELECT 1 FROM EpisodeRecord er WHERE er.nightRecord.id = nr.id
                   )) OR
                   (:hasEpisode = FALSE AND NOT EXISTS (
                       SELECT 1 FROM EpisodeRecord er WHERE er.nightRecord.id = nr.id
                   )))
            ORDER BY nr.date DESC, nr.measurementTime DESC, nr.createdAt DESC
            """)
    Page<NightRecord> findWithFilters(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("attentionLevel") AttentionLevel attentionLevel,
            @Param("hasEpisode") Boolean hasEpisode,
            Pageable pageable);

    @Query("""
            SELECT COUNT(nr) FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
              AND nr.attentionLevel = :attentionLevel
            """)
    long countByPersonIdAndDateBetweenAndAttentionLevel(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to,
            @Param("attentionLevel") AttentionLevel attentionLevel);

    @Query("""
            SELECT COUNT(nr) FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
            """)
    long countByPersonIdAndDateBetween(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("""
            SELECT AVG(nr.glucoseBeforeSleep) FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
            """)
    Double avgGlucoseBeforeSleep(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("""
            SELECT MIN(nr.glucoseBeforeSleep) FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
            """)
    Integer minGlucoseBeforeSleep(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("""
            SELECT MAX(nr.glucoseBeforeSleep) FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
            """)
    Integer maxGlucoseBeforeSleep(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
