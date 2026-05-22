package com.gluconoche.nightrecord;

import com.gluconoche.common.enums.AttentionLevel;
import com.gluconoche.settings.AppSettings;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Calculates attention level and reasons for a night record based on glucose and contextual factors.
 */
@Component
public class AttentionLevelCalculator {

    public record AttentionResult(AttentionLevel level, List<String> reasons) {}

    public AttentionResult calculate(NightRecord record, AppSettings settings) {
        List<String> reasons = new ArrayList<>();
        int glucose = record.getGlucoseBeforeSleep();

        // RED conditions take priority
        if (glucose < settings.getCriticalGlucoseThreshold()) {
            reasons.add("Glucosa crítica antes de dormir (" + glucose + " mg/dL)");
            return new AttentionResult(AttentionLevel.RED, reasons);
        }
        if (glucose > settings.getHighGlucoseThreshold()) {
            reasons.add("Glucosa muy elevada antes de dormir (" + glucose + " mg/dL)");
            return new AttentionResult(AttentionLevel.RED, reasons);
        }

        // YELLOW conditions
        boolean isYellow = false;

        if (glucose < settings.getLowGlucoseThreshold()) {
            reasons.add("Glucosa baja antes de dormir (" + glucose + " mg/dL)");
            isYellow = true;
        } else if (glucose > settings.getBedtimeTargetMax()) {
            reasons.add("Glucosa por encima del rango objetivo al acostarse (" + glucose + " mg/dL)");
            isYellow = true;
        }

        if (!record.isHadBedtimeSnack() && glucose < 120) {
            reasons.add("Sin colación nocturna con glucosa baja (" + glucose + " mg/dL)");
            isYellow = true;
        }

        if (record.getStressLevel() != null) {
            switch (record.getStressLevel()) {
                case HIGH -> {
                    reasons.add("Nivel de estrés alto");
                    isYellow = true;
                }
                default -> {}
            }
        }

        if (record.getSleepQuality() != null) {
            switch (record.getSleepQuality()) {
                case POOR -> {
                    reasons.add("Calidad del sueño mala");
                    isYellow = true;
                }
                default -> {}
            }
        }

        if (isYellow) {
            return new AttentionResult(AttentionLevel.YELLOW, reasons);
        }

        // GREEN: within target range
        return new AttentionResult(AttentionLevel.GREEN, reasons);
    }
}
