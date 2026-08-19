package com.nhom_5.server.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@Tag(name = "Kiểm thử (Test & Health)", description = "Các API kiểm tra trạng thái và kết nối hệ thống Backend")
@RestController
@RequestMapping("/test")
public class TestController {

    @Operation(
            summary = "Kiểm tra kết nối Backend & CORS",
            description = "Trả về trạng thái hoạt động của Backend server kèm thời gian thực để kiểm tra kết nối từ Client hoặc Swagger UI."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Kết nối thành công"),
            @ApiResponse(responseCode = "500", description = "Lỗi máy chủ nội bộ")
    })
    @GetMapping("/ping")
    public ResponseEntity<Map<String, Object>> ping() {
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "message", "Backend API connected successfully with CORS!",
                "timestamp", Instant.now().toString()
        ));
    }
}

