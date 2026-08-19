package com.nhom_5.server.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Mẫu phản hồi chuẩn (Standard API Response Wrapper) của hệ thống")
public class ApiResponse<T> {

    @Schema(description = "Mã trạng thái HTTP hoặc mã nghiệp vụ", example = "200")
    private int code;

    @Schema(description = "Trạng thái thực thi", example = "SUCCESS")
    private String status;

    @Schema(description = "Thông điệp phản hồi", example = "Thao tác thành công")
    private String message;

    @Schema(description = "Dữ liệu trả về")
    private T data;

    @Schema(description = "Danh sách lỗi chi tiết (nếu có)")
    private List<FieldErrorDto> errors;

    @Builder.Default
    @Schema(description = "Thời gian phản hồi (UTC ISO-8601)", example = "2026-08-19T08:15:30Z")
    private Instant timestamp = Instant.now();

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .status("SUCCESS")
                .message("Thành công")
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .code(200)
                .status("SUCCESS")
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> success(int code, String message, T data) {
        return ApiResponse.<T>builder()
                .code(code)
                .status("SUCCESS")
                .message(message)
                .data(data)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message) {
        return ApiResponse.<T>builder()
                .code(code)
                .status("ERROR")
                .message(message)
                .timestamp(Instant.now())
                .build();
    }

    public static <T> ApiResponse<T> error(int code, String message, List<FieldErrorDto> errors) {
        return ApiResponse.<T>builder()
                .code(code)
                .status("ERROR")
                .message(message)
                .errors(errors)
                .timestamp(Instant.now())
                .build();
    }
}
