package com.gluconoche.nightrecord.dto;

import com.gluconoche.common.enums.SleepQuality;
import com.gluconoche.common.enums.StressLevel;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class NightRecordRequest {

    // Date is ignored on create; backend uses Uruguay local date.
    // Kept for edit operations.
    private LocalDate date;

    private LocalTime measurementTime;

    @NotNull(message = "La glucosa antes de dormir es obligatoria")
    @Min(value = 10, message = "La glucosa debe ser al menos 10 mg/dL")
    @Max(value = 500, message = "La glucosa no puede superar 500 mg/dL")
    private Integer glucoseBeforeSleep;

    @Min(value = 20, message = "La glucosa al despertar debe ser al menos 20 mg/dL")
    @Max(value = 600, message = "La glucosa al despertar no puede superar 600 mg/dL")
    private Integer glucoseWakeup;

    private boolean hadBedtimeSnack = false;

    private String snackDescription;

    @NotNull(message = "La hora de acostarse es obligatoria")
    private LocalTime bedtime;

    private LocalTime wakeTime;

    @NotNull(message = "La calidad del sueño es obligatoria")
    private SleepQuality sleepQuality;

    private boolean physicalActivityToday = false;

    @NotNull(message = "El nivel de estrés es obligatorio")
    private StressLevel stressLevel;

    private String notes;

    private String alcohol;

    private String dinnerType;

    private String exerciseLevel;
}
