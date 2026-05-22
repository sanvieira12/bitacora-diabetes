package com.gluconoche.settings;

import com.gluconoche.person.CurrentPersonProvider;
import com.gluconoche.settings.dto.SettingsMapper;
import com.gluconoche.settings.dto.SettingsRequest;
import com.gluconoche.settings.dto.SettingsResponse;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SettingsService {

    private final SettingsRepository settingsRepository;
    private final CurrentPersonProvider currentPersonProvider;
    private final SettingsMapper settingsMapper;

    @Transactional(readOnly = true)
    public SettingsResponse getSettings() {
        return settingsMapper.toResponse(findSettings());
    }

    @Transactional
    public SettingsResponse updateSettings(SettingsRequest request) {
        AppSettings settings = findSettings();
        settingsMapper.updateFromRequest(settings, request);
        return settingsMapper.toResponse(settingsRepository.save(settings));
    }

    public AppSettings findSettings() {
        return settingsRepository.findByPersonId(currentPersonProvider.getPersonId())
                .orElseThrow(() -> new EntityNotFoundException("Settings not found for current person"));
    }
}
