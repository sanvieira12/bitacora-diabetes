package com.gluconoche.report.dto;

import com.gluconoche.episode.dto.EpisodeResponse;
import com.gluconoche.statistics.dto.GlucoseTrendPoint;
import com.gluconoche.statistics.dto.StatisticsSummaryResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class DoctorSummaryResponse {

    private String personName;
    private LocalDate from;
    private LocalDate to;
    private OffsetDateTime generatedAt;
    private StatisticsSummaryResponse statistics;
    private List<GlucoseTrendPoint> glucoseTrend;
    private List<EpisodeResponse> episodes;
    private String emergencyProtocolText;
    private String doctorNotes;
    private String disclaimer;
}
