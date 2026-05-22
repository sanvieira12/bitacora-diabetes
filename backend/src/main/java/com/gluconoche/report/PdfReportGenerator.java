package com.gluconoche.report;

import com.gluconoche.episode.dto.EpisodeResponse;
import com.gluconoche.report.dto.DoctorSummaryResponse;
import com.gluconoche.statistics.dto.GlucoseTrendPoint;
import com.gluconoche.statistics.dto.StatisticsSummaryResponse;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.kernel.pdf.canvas.draw.SolidLine;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Slf4j
@Component
public class PdfReportGenerator {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATETIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DeviceRgb HEADER_COLOR = new DeviceRgb(30, 58, 138); // dark blue
    private static final DeviceRgb LIGHT_BG = new DeviceRgb(240, 244, 255);
    private static final String DISCLAIMER =
            "Esta información es orientativa y no reemplaza el criterio clínico de su médico.";

    public byte[] generate(DoctorSummaryResponse data) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdf = new PdfDocument(writer);
            Document doc = new Document(pdf, PageSize.A4);
            doc.setMargins(50, 50, 70, 50);

            PdfFont boldFont = PdfFontFactory.createFont(
                    com.itextpdf.io.font.constants.StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(
                    com.itextpdf.io.font.constants.StandardFonts.HELVETICA);
            PdfFont italicFont = PdfFontFactory.createFont(
                    com.itextpdf.io.font.constants.StandardFonts.HELVETICA_OBLIQUE);

            // ---- HEADER ----
            Paragraph title = new Paragraph("GlucoNoche - Informe para la diabetóloga")
                    .setFont(boldFont)
                    .setFontSize(18)
                    .setFontColor(HEADER_COLOR)
                    .setTextAlignment(TextAlignment.CENTER);
            doc.add(title);

            doc.add(new Paragraph("Paciente: " + data.getPersonName())
                    .setFont(boldFont).setFontSize(12).setTextAlignment(TextAlignment.CENTER));

            doc.add(new Paragraph(
                    "Período: " + data.getFrom().format(DATE_FMT) + " al " + data.getTo().format(DATE_FMT))
                    .setFont(regularFont).setFontSize(10).setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.DARK_GRAY));

            doc.add(new Paragraph("Generado: " + data.getGeneratedAt().format(DATETIME_FMT))
                    .setFont(italicFont).setFontSize(9).setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY));

            doc.add(new LineSeparator(new SolidLine()).setMarginTop(8).setMarginBottom(16));

            // ---- SECTION 1: STATISTICS ----
            doc.add(sectionHeader("1. Estadísticas del período", boldFont));
            StatisticsSummaryResponse stats = data.getStatistics();

            Table statsTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .useAllAvailableWidth();
            addStatRow(statsTable, regularFont, "Total noches registradas:", String.valueOf(stats.getTotalNights()));
            addStatRow(statsTable, regularFont, "Total episodios hipoglucémicos:", String.valueOf(stats.getTotalEpisodes()));
            addStatRow(statsTable, regularFont, "Noches con episodio:", stats.getNightsWithEpisode() + " (" + stats.getEpisodeRate() + "%)");
            addStatRow(statsTable, regularFont, "Glucosa promedio antes de dormir:", stats.getAvgGlucoseBeforeSleep() + " mg/dL");
            addStatRow(statsTable, regularFont, "Glucosa mínima:", stats.getMinGlucoseBeforeSleep() + " mg/dL");
            addStatRow(statsTable, regularFont, "Glucosa máxima:", stats.getMaxGlucoseBeforeSleep() + " mg/dL");
            addStatRow(statsTable, regularFont, "Noches en rango óptimo (VERDE):", String.valueOf(stats.getNightsGreen()));
            addStatRow(statsTable, regularFont, "Noches con atención (AMARILLO):", String.valueOf(stats.getNightsYellow()));
            addStatRow(statsTable, regularFont, "Noches urgentes (ROJO):", String.valueOf(stats.getNightsRed()));
            addStatRow(statsTable, regularFont, "Tiempo promedio de recuperación:", stats.getAvgRecoveryTimeMinutes() + " min");
            doc.add(statsTable);

            doc.add(new Paragraph("\n"));

            // ---- SECTION 2: EPISODES ----
            doc.add(sectionHeader("2. Episodios hipoglucémicos", boldFont));
            List<EpisodeResponse> episodes = data.getEpisodes();
            if (episodes == null || episodes.isEmpty()) {
                doc.add(new Paragraph("No se registraron episodios en el período.")
                        .setFont(italicFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
            } else {
                Table episodeTable = new Table(UnitValue.createPercentArray(new float[]{15, 10, 15, 35, 15, 10}))
                        .useAllAvailableWidth();
                // Header row
                for (String h : new String[]{"Fecha", "Hora", "Glucosa", "Intervención", "Recuperación", "Severidad"}) {
                    episodeTable.addHeaderCell(new Cell().add(new Paragraph(h)
                            .setFont(boldFont).setFontSize(8))
                            .setBackgroundColor(HEADER_COLOR)
                            .setFontColor(ColorConstants.WHITE));
                }
                for (EpisodeResponse ep : episodes) {
                    episodeTable.addCell(cell(ep.getEpisodeDate().format(DATE_FMT), regularFont));
                    episodeTable.addCell(cell(ep.getEpisodeTime().toString(), regularFont));
                    String glucose = ep.getGlucoseAtEpisode() != null
                            ? ep.getGlucoseAtEpisode() + " mg/dL" : "-";
                    episodeTable.addCell(cell(glucose, regularFont));
                    episodeTable.addCell(cell(ep.getIntervention(), regularFont));
                    String recovery = ep.getRecoveryTimeMinutes() != null
                            ? ep.getRecoveryTimeMinutes() + " min" : "-";
                    episodeTable.addCell(cell(recovery, regularFont));
                    episodeTable.addCell(cell(ep.getSeverity().name(), regularFont));
                }
                doc.add(episodeTable);
            }

            doc.add(new Paragraph("\n"));

            // ---- SECTION 3: GLUCOSE TREND TABLE ----
            doc.add(sectionHeader("3. Tendencia de glucosa antes de dormir", boldFont));
            List<GlucoseTrendPoint> trend = data.getGlucoseTrend();
            if (trend == null || trend.isEmpty()) {
                doc.add(new Paragraph("Sin datos de tendencia para el período.")
                        .setFont(italicFont).setFontSize(10).setFontColor(ColorConstants.GRAY));
            } else {
                Table trendTable = new Table(UnitValue.createPercentArray(new float[]{40, 35, 25}))
                        .useAllAvailableWidth();
                for (String h : new String[]{"Fecha", "Glucosa (mg/dL)", "Nivel"}) {
                    trendTable.addHeaderCell(new Cell().add(new Paragraph(h)
                            .setFont(boldFont).setFontSize(8))
                            .setBackgroundColor(HEADER_COLOR)
                            .setFontColor(ColorConstants.WHITE));
                }
                for (GlucoseTrendPoint point : trend) {
                    trendTable.addCell(cell(point.getDate().format(DATE_FMT), regularFont));
                    trendTable.addCell(cell(String.valueOf(point.getGlucoseBeforeSleep()), regularFont));
                    trendTable.addCell(cell(translateLevel(point.getAttentionLevel()), regularFont));
                }
                doc.add(trendTable);
            }

            doc.add(new Paragraph("\n"));

            // ---- EMERGENCY PROTOCOL ----
            if (data.getEmergencyProtocolText() != null && !data.getEmergencyProtocolText().isBlank()) {
                doc.add(sectionHeader("Protocolo de emergencia", boldFont));
                doc.add(new Paragraph(data.getEmergencyProtocolText())
                        .setFont(regularFont).setFontSize(9)
                        .setBackgroundColor(LIGHT_BG)
                        .setPadding(8));
            }

            // ---- DOCTOR NOTES ----
            if (data.getDoctorNotes() != null && !data.getDoctorNotes().isBlank()) {
                doc.add(new Paragraph("\n"));
                doc.add(sectionHeader("Notas para la médica", boldFont));
                doc.add(new Paragraph(data.getDoctorNotes())
                        .setFont(regularFont).setFontSize(10));
            }

            // ---- FOOTER DISCLAIMER (added as last paragraph) ----
            doc.add(new Paragraph("\n\n"));
            doc.add(new LineSeparator(new SolidLine()));
            doc.add(new Paragraph(DISCLAIMER)
                    .setFont(italicFont)
                    .setFontSize(8)
                    .setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            doc.close();
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("Error generating PDF report", e);
            throw new RuntimeException("Error al generar el informe PDF: " + e.getMessage(), e);
        }
    }

    private Paragraph sectionHeader(String text, PdfFont font) {
        return new Paragraph(text)
                .setFont(font)
                .setFontSize(13)
                .setFontColor(HEADER_COLOR)
                .setMarginBottom(6)
                .setMarginTop(10);
    }

    private void addStatRow(Table table, PdfFont font, String label, String value) {
        table.addCell(new Cell().add(new Paragraph(label).setFont(font).setFontSize(9))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
        table.addCell(new Cell().add(new Paragraph(value).setFont(font).setFontSize(9))
                .setBorder(com.itextpdf.layout.borders.Border.NO_BORDER));
    }

    private Cell cell(String text, PdfFont font) {
        return new Cell().add(new Paragraph(text != null ? text : "-").setFont(font).setFontSize(8));
    }

    private String translateLevel(String level) {
        return switch (level) {
            case "GREEN" -> "Óptimo";
            case "YELLOW" -> "Atención";
            case "RED" -> "Urgente";
            default -> level;
        };
    }
}
