package com.gluconoche.admin.importer;

import java.util.List;

record GlucoseExcelParseResult(
        List<GlucoseExcelRow> rows,
        List<String> errors) {
}
