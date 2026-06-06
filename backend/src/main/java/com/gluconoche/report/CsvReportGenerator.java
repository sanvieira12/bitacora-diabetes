package com.gluconoche.report;

import com.gluconoche.episode.EpisodeRecord;
import com.gluconoche.nightrecord.NightRecord;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVPrinter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.StringWriter;
import java.time.LocalDate;
import java.util.List;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

/**
 * Generates a ZIP file containing two CSVs: nights.csv and episodes.csv.
 */
@Slf4j
@Component
public class CsvReportGenerator {

    private static final String[] NIGHTS_HEADERS = {
            "fecha", "hora_medicion", "glucosa_antes_dormir", "glucosa_al_despertar", "tuvo_colacion",
            "descripcion_colacion", "hora_acostarse", "hora_despertar", "calidad_sueno",
            "actividad_fisica", "nivel_estres", "nivel_atencion", "notas"
    };

    private static final String[] EPISODES_HEADERS = {
            "fecha", "hora", "sintomas", "glucosa_en_episodio", "intervencion",
            "glucosa_post_intervencion", "tiempo_recuperacion_min", "severidad", "notas"
    };

    public byte[] generateZip(LocalDate from, LocalDate to,
                               List<NightRecord> nights, List<EpisodeRecord> episodes) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zip = new ZipOutputStream(baos)) {

            zip.putNextEntry(new ZipEntry("noches.csv"));
            zip.write(generateNightsCsv(nights));
            zip.closeEntry();

            zip.putNextEntry(new ZipEntry("episodios.csv"));
            zip.write(generateEpisodesCsv(episodes));
            zip.closeEntry();

            zip.finish();
            return baos.toByteArray();
        } catch (IOException e) {
            log.error("Error generating CSV ZIP", e);
            throw new RuntimeException("Error al generar el archivo CSV: " + e.getMessage(), e);
        }
    }

    private byte[] generateNightsCsv(List<NightRecord> nights) throws IOException {
        StringWriter sw = new StringWriter();
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(NIGHTS_HEADERS)
                .build();
        try (CSVPrinter printer = new CSVPrinter(sw, format)) {
            for (NightRecord n : nights) {
                printer.printRecord(
                        n.getDate(),
                        n.getMeasurementTime() != null ? n.getMeasurementTime() : "",
                        n.getGlucoseBeforeSleep(),
                        n.getGlucoseWakeup() != null ? n.getGlucoseWakeup() : "",
                        n.isHadBedtimeSnack() ? "Sí" : "No",
                        n.getSnackDescription() != null ? n.getSnackDescription() : "",
                        n.getBedtime(),
                        n.getWakeTime() != null ? n.getWakeTime() : "",
                        n.getSleepQuality().name(),
                        n.isPhysicalActivityToday() ? "Sí" : "No",
                        n.getStressLevel().name(),
                        n.getAttentionLevel().name(),
                        n.getNotes() != null ? n.getNotes() : ""
                );
            }
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    private byte[] generateEpisodesCsv(List<EpisodeRecord> episodes) throws IOException {
        StringWriter sw = new StringWriter();
        CSVFormat format = CSVFormat.DEFAULT.builder()
                .setHeader(EPISODES_HEADERS)
                .build();
        try (CSVPrinter printer = new CSVPrinter(sw, format)) {
            for (EpisodeRecord ep : episodes) {
                String symptoms = ep.getSymptoms() != null
                        ? String.join(", ", ep.getSymptoms()) : "";
                printer.printRecord(
                        ep.getEpisodeDate(),
                        ep.getEpisodeTime(),
                        symptoms,
                        ep.getGlucoseAtEpisode() != null ? ep.getGlucoseAtEpisode() : "",
                        ep.getIntervention(),
                        ep.getGlucoseAfterIntervention() != null ? ep.getGlucoseAfterIntervention() : "",
                        ep.getRecoveryTimeMinutes() != null ? ep.getRecoveryTimeMinutes() : "",
                        ep.getSeverity().name(),
                        ep.getNotes() != null ? ep.getNotes() : ""
                );
            }
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
