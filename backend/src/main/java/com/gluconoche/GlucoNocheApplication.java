package com.gluconoche;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@SpringBootApplication
public class GlucoNocheApplication {

    public static void main(String[] args) {
        normalizeDatabaseEnvironment();
        SpringApplication.run(GlucoNocheApplication.class, args);
    }

    private static void normalizeDatabaseEnvironment() {
        if (hasText(System.getenv("DB_URL")) || hasText(System.getProperty("DB_URL"))) {
            return;
        }

        String rawDatabaseUrl = firstNonBlank(System.getenv("DATABASE_URL"), System.getProperty("DATABASE_URL"));
        if (!hasText(rawDatabaseUrl)) {
            return;
        }

        if (rawDatabaseUrl.startsWith("jdbc:")) {
            setIfMissing("DB_URL", rawDatabaseUrl);
            return;
        }

        if (!(rawDatabaseUrl.startsWith("postgres://") || rawDatabaseUrl.startsWith("postgresql://"))) {
            return;
        }

        try {
            URI uri = URI.create(rawDatabaseUrl);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String dbName = uri.getPath() != null ? uri.getPath().replaceFirst("^/", "") : "";

            if (!hasText(host) || !hasText(dbName)) {
                return;
            }

            StringBuilder jdbcUrl = new StringBuilder("jdbc:postgresql://")
                    .append(host)
                    .append(":")
                    .append(port)
                    .append("/")
                    .append(dbName);

            if (hasText(uri.getQuery())) {
                jdbcUrl.append("?").append(uri.getQuery());
            }

            setIfMissing("DB_URL", jdbcUrl.toString());

            if (hasText(uri.getUserInfo())) {
                String[] userInfo = uri.getUserInfo().split(":", 2);
                if (userInfo.length > 0 && hasText(userInfo[0])) {
                    setIfMissing("DB_USER", decode(userInfo[0]));
                }
                if (userInfo.length > 1 && hasText(userInfo[1])) {
                    setIfMissing("DB_PASSWORD", decode(userInfo[1]));
                }
            }
        } catch (IllegalArgumentException ignored) {
            // If DATABASE_URL is malformed, Spring keeps regular config resolution.
        }
    }

    private static void setIfMissing(String key, String value) {
        if (!hasText(System.getProperty(key)) && hasText(value)) {
            System.setProperty(key, value);
        }
    }

    private static String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }

    private static String firstNonBlank(String a, String b) {
        if (hasText(a)) {
            return a;
        }
        return hasText(b) ? b : null;
    }

    private static boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
