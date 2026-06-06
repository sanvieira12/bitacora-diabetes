package com.gluconoche.admin.importer;

import com.gluconoche.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/admin/import")
@RequiredArgsConstructor
public class GlucoseExcelImportController {

    private final GlucoseExcelImportService glucoseExcelImportService;

    @Value("${gluconoche.import.glucose-file:imports/Glucemias_2026_Ordenadas.xlsx}")
    private String localImportFile;

    @PostMapping(
            value = "/glucose-excel",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<GlucoseImportSummary> importUpload(
            @RequestPart("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("The Excel file is empty.");
        }
        try (InputStream inputStream = file.getInputStream()) {
            return ApiResponse.ok(glucoseExcelImportService.importWorkbook(inputStream));
        }
    }

    @PostMapping("/glucose-excel/local")
    public ApiResponse<GlucoseImportSummary> importLocalFile() throws IOException {
        Path path = resolveLocalImportPath();
        try (InputStream inputStream = Files.newInputStream(path)) {
            return ApiResponse.ok(glucoseExcelImportService.importWorkbook(inputStream));
        }
    }

    private Path resolveLocalImportPath() {
        Path configuredPath = Path.of(localImportFile);
        if (Files.isRegularFile(configuredPath)) {
            return configuredPath;
        }

        Path rootRelativePath = Path.of("backend").resolve(configuredPath);
        if (Files.isRegularFile(rootRelativePath)) {
            return rootRelativePath;
        }

        throw new IllegalArgumentException(
                "Local import file not found: " + configuredPath.toAbsolutePath());
    }
}
