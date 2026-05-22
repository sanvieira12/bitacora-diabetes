package com.gluconoche.settings;

import com.gluconoche.common.ApiResponse;
import com.gluconoche.settings.dto.SettingsRequest;
import com.gluconoche.settings.dto.SettingsResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;

    @GetMapping
    public ResponseEntity<ApiResponse<SettingsResponse>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.getSettings()));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<SettingsResponse>> updateSettings(
            @Valid @RequestBody SettingsRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(settingsService.updateSettings(request)));
    }
}
