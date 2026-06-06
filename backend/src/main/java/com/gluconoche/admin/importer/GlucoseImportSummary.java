package com.gluconoche.admin.importer;

import java.util.List;

public record GlucoseImportSummary(
        int importedNightRecords,
        int skippedDuplicates,
        int createdEpisodes,
        List<String> errors) {
}
