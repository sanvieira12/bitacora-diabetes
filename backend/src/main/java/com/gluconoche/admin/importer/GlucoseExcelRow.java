package com.gluconoche.admin.importer;

import java.time.LocalDate;
import java.time.LocalTime;

record GlucoseExcelRow(
        int sourceRow,
        LocalDate date,
        LocalTime time,
        int glucose) {
}
