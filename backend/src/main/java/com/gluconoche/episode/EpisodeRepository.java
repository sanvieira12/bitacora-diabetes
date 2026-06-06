package com.gluconoche.episode;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public interface EpisodeRepository extends JpaRepository<EpisodeRecord, UUID> {

    List<EpisodeRecord> findByNightRecordId(UUID nightRecordId);

    boolean existsByNightRecordIdAndEpisodeDateAndEpisodeTimeAndGlucoseAtEpisode(
            UUID nightRecordId,
            LocalDate episodeDate,
            LocalTime episodeTime,
            Integer glucoseAtEpisode);

    Page<EpisodeRecord> findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateDesc(
            UUID personId, LocalDate from, LocalDate to, Pageable pageable);

    List<EpisodeRecord> findAllByPersonIdAndEpisodeDateBetweenOrderByEpisodeDateAsc(
            UUID personId, LocalDate from, LocalDate to);

    @Query("""
            SELECT COUNT(DISTINCT nr.id) FROM NightRecord nr
            WHERE nr.person.id = :personId
              AND nr.date BETWEEN :from AND :to
              AND EXISTS (SELECT 1 FROM EpisodeRecord er WHERE er.nightRecord.id = nr.id)
            """)
    long countNightsWithEpisode(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    @Query("""
            SELECT AVG(er.recoveryTimeMinutes) FROM EpisodeRecord er
            WHERE er.person.id = :personId
              AND er.episodeDate BETWEEN :from AND :to
              AND er.recoveryTimeMinutes IS NOT NULL
            """)
    Double avgRecoveryTimeMinutes(
            @Param("personId") UUID personId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
