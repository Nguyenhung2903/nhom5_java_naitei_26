package com.nhom_5.server.controller;

import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.Map;

@Tag(name = "14. Kiểm thử & Phân quyền (Test RBAC)", description = "Các API mẫu để kiểm tra kết nối và cơ chế phân quyền RBAC (Role-Based Access Control)")
@RestController
@RequestMapping("/test")
public class TestController {

    @Operation(
            summary = "[PUBLIC] Kiểm tra kết nối Backend & CORS",
            description = "Endpoint công khai, không cần đăng nhập."
    )
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<Map<String, Object>>> ping() {
        return ResponseEntity.ok(ApiResponse.success("Backend API connected successfully with CORS!", Map.of(
                "status", "UP",
                "timestamp", Instant.now().toString()
        )));
    }

    @Operation(
            summary = "[PUBLIC] Endpoint công khai",
            description = "Bất kỳ ai (chưa đăng nhập hoặc đã đăng nhập) đều có thể gọi endpoint này."
    )
    @GetMapping("/public")
    public ResponseEntity<ApiResponse<String>> publicEndpoint() {
        return ResponseEntity.ok(ApiResponse.success("Dữ liệu công khai: Ai cũng có thể xem được nội dung này!"));
    }

    @Operation(
            summary = "[USER] Endpoint yêu cầu Đăng nhập (USER hoặc ADMIN)",
            description = "Yêu cầu Bearer Token hợp lệ. Cả vai trò USER và ADMIN đều có thể truy cập.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Truy cập thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/user-only")
    public ResponseEntity<ApiResponse<Map<String, Object>>> userOnlyEndpoint() {
        User currentUser = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                "Xin chào " + currentUser.getFullName() + "! Bạn đã truy cập thành công vào khu vực dành cho Thành viên.",
                Map.of(
                        "userId", currentUser.getId(),
                        "username", currentUser.getUsername(),
                        "role", currentUser.getRole().name()
                )
        ));
    }

    @Operation(
            summary = "[ADMIN] Endpoint bảo mật chỉ dành cho Quản trị viên",
            description = "Yêu cầu Bearer Token có vai trò là ADMIN. Nếu tài khoản USER gọi vào sẽ trả về 403 Forbidden.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Truy cập thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không đủ quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/admin-only")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminOnlyEndpoint() {
        User currentUser = SecurityUtil.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(
                "Xác thực Quản trị viên thành công! Xin chào Admin " + currentUser.getFullName() + ".",
                Map.of(
                        "userId", currentUser.getId(),
                        "username", currentUser.getUsername(),
                        "role", currentUser.getRole().name(),
                        "privileges", "ALL_ADMIN_PRIVILEGES"
                )
        ));
    }
}
