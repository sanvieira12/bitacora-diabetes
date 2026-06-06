package com.gluconoche.admin.importer;

import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThat;

class GlucoseExcelParserTest {

    private final GlucoseExcelParser parser = new GlucoseExcelParser();

    @Test
    void parsesHistoricalWorkbookAndSupportedTimeFormats() throws IOException {
        try (var inputStream = Files.newInputStream(importFile())) {
            GlucoseExcelParseResult result = parser.parse(inputStream);

            assertThat(result.errors()).isEmpty();
            assertThat(result.rows()).hasSize(75);
            assertThat(result.rows().stream().map(GlucoseExcelRow::date).distinct())
                    .hasSize(60);
            assertThat(result.rows().stream().filter(row -> row.glucose() < 70))
                    .hasSize(10);
            assertThat(result.rows().stream().filter(row -> row.glucose() == 70))
                    .hasSize(1);
            assertThat(result.rows())
                    .anySatisfy(row -> {
                        assertThat(row.date()).isEqualTo(LocalDate.of(2026, 4, 24));
                        assertThat(row.time()).isEqualTo(LocalTime.of(12, 24));
                        assertThat(row.glucose()).isEqualTo(50);
                    });
        }
    }

    private Path importFile() {
        return Path.of("imports", "Glucemias_2026_Ordenadas.xlsx");
    }
}
