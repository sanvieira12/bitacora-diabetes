package com.gluconoche.auth.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthStatusResponse {
    private boolean mustChangePin;
    private boolean locked;
    private OffsetDateTime lockedUntil;
}
