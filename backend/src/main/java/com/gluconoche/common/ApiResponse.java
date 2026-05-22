package com.gluconoche.common;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private T data;
    private String error;
    private List<String> details;
    private PageMeta page;

    public static <T> ApiResponse<T> ok(T data) {
        return ApiResponse.<T>builder().data(data).build();
    }

    public static <T> ApiResponse<T> error(String message) {
        return ApiResponse.<T>builder().error(message).build();
    }

    public static <T> ApiResponse<T> error(String message, List<String> details) {
        return ApiResponse.<T>builder().error(message).details(details).build();
    }

    public static <T> ApiResponse<T> paged(T data, PageMeta pageMeta) {
        return ApiResponse.<T>builder().data(data).page(pageMeta).build();
    }

    @Data
    @Builder
    public static class PageMeta {
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;
    }
}
