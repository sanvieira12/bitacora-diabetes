package com.gluconoche.episode;

import com.gluconoche.common.ApiResponse;
import com.gluconoche.episode.dto.EpisodeRequest;
import com.gluconoche.episode.dto.EpisodeResponse;
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
@RequestMapping("/api/episodes")
@RequiredArgsConstructor
public class EpisodeController {

    private final EpisodeService episodeService;

    @GetMapping
    public ApiResponse<List<EpisodeResponse>> findAll(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        LocalDate effectiveTo = to != null ? to : LocalDate.now();
        LocalDate effectiveFrom = from != null ? from : effectiveTo.minusDays(30);
        Pageable pageable = PageRequest.of(page, size);

        Page<EpisodeResponse> result = episodeService.findAll(effectiveFrom, effectiveTo, pageable);
        return ApiResponse.paged(result.getContent(), EpisodeService.buildPageMeta(result));
    }

    @GetMapping("/{id}")
    public ApiResponse<EpisodeResponse> findById(@PathVariable UUID id) {
        return ApiResponse.ok(episodeService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<EpisodeResponse> create(@Valid @RequestBody EpisodeRequest request) {
        return ApiResponse.ok(episodeService.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<EpisodeResponse> update(
            @PathVariable UUID id,
            @Valid @RequestBody EpisodeRequest request) {
        return ApiResponse.ok(episodeService.update(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        episodeService.delete(id);
    }
}
