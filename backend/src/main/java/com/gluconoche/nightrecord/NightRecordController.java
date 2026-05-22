package com.gluconoche.nightrecord;

import com.gluconoche.common.ApiResponse;
import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.nightrecord.dto.NightRecordRequest;
import com.gluconoche.nightrecord.dto.NightRecordResponse;
import com.gluconoche.nightrecord.dto.NightRecordSummaryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/night-records")
@RequiredArgsConstructor
public class NightRecordController {

    private final NightRecordService nightRecordService;

    @GetMapping
    public ApiResponse<List<NightRecordSummaryResponse>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(required = false) Boolean hasEpisode,
            @RequestParam(required = false) String attentionLevel,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        // Default to last 30 days if not provided
        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(30);

        AttentionLevel level = attentionLevel != null ? AttentionLevel.valueOf(attentionLevel.toUpperCase()) : null;
        Pageable pageable = PageRequest.of(page, size);

        Page<NightRecordSummaryResponse> result = nightRecordService.findAll(
                effectiveFrom, effectiveTo, hasEpisode, level, pageable);

        return ApiResponse.paged(result.getContent(), NightRecordService.buildPageMeta(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<NightRecordResponse> findById(@PathVariable UUID id) {
        return ApiResponse.ok(nightRecordService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<NightRecordResponse> create(@Valid @RequestBody NightRecordRequest request) {
        return ApiResponse.ok(nightRecordService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<NightRecordResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody NightRecordRequest request) {
        return ApiResponse.ok(nightRecordService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        nightRecordService.delete(id);
    }
}
