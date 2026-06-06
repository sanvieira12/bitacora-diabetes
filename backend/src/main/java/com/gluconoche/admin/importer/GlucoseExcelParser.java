package com.gluconoche.admin.importer;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeFormatterBuilder;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoField;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Component
public class GlucoseExcelParser {

    private static final String SHEET_NAME = "Glucemias 2026";
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/uuuu");
    private static final DateTimeFormatter TWELVE_HOUR_TIME_FORMAT =
            new DateTimeFormatterBuilder()
                    .parseCaseInsensitive()
                    .appendPattern("h:mm a")
                    .toFormatter(Locale.ENGLISH);
    private static final DateTimeFormatter TWENTY_FOUR_HOUR_TIME_FORMAT =
            new DateTimeFormatterBuilder()
                    .appendValue(ChronoField.HOUR_OF_DAY)
                    .appendLiteral(':')
                    .appendValue(ChronoField.MINUTE_OF_HOUR, 2)
                    .toFormatter(Locale.ROOT);

    private final DataFormatter dataFormatter = new DataFormatter(Locale.ENGLISH);

    public GlucoseExcelParseResult parse(InputStream inputStream) {
        try (Workbook workbook = WorkbookFactory.create(inputStream)) {
            Sheet sheet = workbook.getSheet(SHEET_NAME);
            if (sheet == null) {
                throw new IllegalArgumentException(
                        "The workbook must contain a sheet named '" + SHEET_NAME + "'.");
            }

            validateHeader(sheet.getRow(0));

            List<GlucoseExcelRow> rows = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            for (int rowIndex = 1; rowIndex <= sheet.getLastRowNum(); rowIndex++) {
                Row row = sheet.getRow(rowIndex);
                if (row == null || isEmpty(row)) {
                    continue;
                }

                try {
                    rows.add(new GlucoseExcelRow(
                            rowIndex + 1,
                            parseDate(row.getCell(0, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL)),
                            parseTime(row.getCell(1, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL)),
                            parseGlucose(row.getCell(2, Row.MissingCellPolicy.RETURN_BLANK_AS_NULL))));
                } catch (IllegalArgumentException ex) {
                    errors.add("Row " + (rowIndex + 1) + ": " + ex.getMessage());
                }
            }
            return new GlucoseExcelParseResult(List.copyOf(rows), List.copyOf(errors));
        } catch (IOException ex) {
            throw new IllegalArgumentException("Could not read the Excel file.", ex);
        }
    }

    private void validateHeader(Row header) {
        if (header == null
                || !"Fecha".equals(cellText(header.getCell(0)))
                || !"Hora".equals(cellText(header.getCell(1)))
                || !"Glucosa (mg/dL)".equals(cellText(header.getCell(2)))) {
            throw new IllegalArgumentException(
                    "Expected columns: Fecha | Hora | Glucosa (mg/dL).");
        }
    }

    private boolean isEmpty(Row row) {
        return cellText(row.getCell(0)).isBlank()
                && cellText(row.getCell(1)).isBlank()
                && cellText(row.getCell(2)).isBlank();
    }

    private LocalDate parseDate(Cell cell) {
        if (cell == null) {
            throw new IllegalArgumentException("Fecha is required.");
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalDate();
        }
        try {
            return LocalDate.parse(cellText(cell), DATE_FORMAT);
        } catch (DateTimeParseException ex) {
            throw new IllegalArgumentException("Invalid Fecha: '" + cellText(cell) + "'.");
        }
    }

    private LocalTime parseTime(Cell cell) {
        if (cell == null) {
            throw new IllegalArgumentException("Hora is required.");
        }
        if (cell.getCellType() == CellType.NUMERIC && DateUtil.isCellDateFormatted(cell)) {
            return cell.getLocalDateTimeCellValue().toLocalTime().withSecond(0).withNano(0);
        }

        String value = cellText(cell)
                .replace('\u00A0', ' ')
                .trim()
                .replaceAll("\\s+", " ");
        for (DateTimeFormatter formatter : List.of(
                TWELVE_HOUR_TIME_FORMAT,
                TWENTY_FOUR_HOUR_TIME_FORMAT)) {
            try {
                return LocalTime.parse(value, formatter);
            } catch (DateTimeParseException ignored) {
                // Try the next supported format.
            }
        }
        throw new IllegalArgumentException("Invalid Hora: '" + value + "'.");
    }

    private int parseGlucose(Cell cell) {
        if (cell == null) {
            throw new IllegalArgumentException("Glucosa is required.");
        }

        double value;
        try {
            value = cell.getCellType() == CellType.NUMERIC
                    ? cell.getNumericCellValue()
                    : Double.parseDouble(cellText(cell).replace(',', '.'));
        } catch (NumberFormatException ex) {
            throw new IllegalArgumentException("Invalid Glucosa: '" + cellText(cell) + "'.");
        }

        if (value != Math.rint(value) || value < 10 || value > 500) {
            throw new IllegalArgumentException(
                    "Glucosa must be a whole number between 10 and 500 mg/dL.");
        }
        return (int) value;
    }

    private String cellText(Cell cell) {
        return cell == null ? "" : dataFormatter.formatCellValue(cell).trim();
    }
}
