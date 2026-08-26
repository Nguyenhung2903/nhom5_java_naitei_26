package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.ChangePasswordRequest;
import com.nhom_5.server.dto.request.LoginRequest;
import com.nhom_5.server.dto.request.RegisterRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.AuthResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "01. Xác thực & Tài khoản (Auth)", description = "Các API đăng ký, đăng nhập, đổi mật khẩu và lấy thông tin tài khoản hiện tại")
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @Operation(
            summary = "[PUBLIC] Đăng ký tài khoản người dùng mới",
            description = "Tạo tài khoản mới cho khách hàng với vai trò mặc định là USER và trạng thái ACTIVE."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Đăng ký thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc username/email đã tồn tại")
    })
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Đăng ký tài khoản thành công", response));
    }

    @Operation(
            summary = "[PUBLIC] Đăng nhập hệ thống",
            description = "Xác thực bằng Username hoặc Email kèm Mật khẩu để nhận JWT Access Token. Mặc định có thể đăng nhập bằng tài khoản admin (Username: admin / Password: Admin@123456)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu gửi lên không đúng định dạng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Sai tài khoản hoặc mật khẩu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Tài khoản bị khóa")
    })
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @Operation(
            summary = "[USER] Lấy thông tin hồ sơ tài khoản hiện tại",
            description = "Yêu cầu đính kèm Header 'Authorization: Bearer <token>' để lấy thông tin cá nhân của người dùng đang đăng nhập.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc token không hợp lệ")
    })
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser() {
        UserProfileDto profile = authService.getCurrentUserProfile();
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin hồ sơ thành công", profile));
    }

    @Operation(
            summary = "[USER] Đổi mật khẩu",
            description = "Cho phép người dùng hiện tại đổi mật khẩu sau khi nhập đúng mật khẩu hiện tại.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Mật khẩu cũ không đúng hoặc xác nhận mật khẩu không khớp"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PostMapping("/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(ApiResponse.success("Đổi mật khẩu thành công", null));
    }
}
