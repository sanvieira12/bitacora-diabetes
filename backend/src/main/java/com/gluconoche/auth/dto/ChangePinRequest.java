package com.gluconoche.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChangePinRequest {

    @NotBlank
    private String currentPin;

    @NotBlank
    private String newPin;
}
