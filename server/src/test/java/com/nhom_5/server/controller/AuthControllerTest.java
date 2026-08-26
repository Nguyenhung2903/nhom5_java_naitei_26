package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.LoginRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.AuthResponse;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class AuthControllerTest {

    @Autowired
    private AuthController authController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        // 1. Tạo tài khoản mẫu thông thường (Active)
        User testUser = User.builder()
                .username("user")
                .password(passwordEncoder.encode("User@123456"))
                .email("user@cinemanest.vn")
                .fullName("Standard Test User")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .phone("0900000002")
                .build();
        userRepository.save(testUser);

        // 2. Tạo tài khoản bị khóa (Locked)
        User lockedUser = User.builder()
                .username("lockeduser")
                .password(passwordEncoder.encode("User@123456"))
                .email("locked@cinemanest.vn")
                .fullName("Locked User")
                .role(Role.USER)
                .status(UserStatus.LOCKED)
                .phone("0900000003")
                .build();
        userRepository.save(lockedUser);
    }

    @Test
    @DisplayName("Đăng nhập thành công bằng email chuẩn (chữ thường)")
    void testLoginWithEmail_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("user@cinemanest.vn")
                .password("User@123456")
                .build();

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Đăng nhập thành công", response.getBody().getMessage());
        assertNotNull(response.getBody().getData().getAccessToken());
        assertEquals("user@cinemanest.vn", response.getBody().getData().getUser().getEmail());
    }

    @Test
    @DisplayName("Đăng nhập thành công khi email viết hoa (Case-insensitive)")
    void testLoginWithEmail_MixedCase_Success() {
        LoginRequest request = LoginRequest.builder()
                .email("User@cinemanest.vn")
                .password("User@123456")
                .build();

        ResponseEntity<ApiResponse<AuthResponse>> response = authController.login(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData().getAccessToken());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
    void testLogin_WrongPassword_ThrowsException() {
        LoginRequest request = LoginRequest.builder()
                .email("user@cinemanest.vn")
                .password("WrongPassword123")
                .build();

        AppException ex = assertThrows(AppException.class, () -> authController.login(request));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi tài khoản không tồn tại")
    void testLogin_UserNotFound_ThrowsException() {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@cinemanest.vn")
                .password("User@123456")
                .build();

        AppException ex = assertThrows(AppException.class, () -> authController.login(request));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi tài khoản bị khóa (LOCKED)")
    void testLogin_AccountLocked_ThrowsException() {
        LoginRequest request = LoginRequest.builder()
                .email("locked@cinemanest.vn")
                .password("User@123456")
                .build();

        AppException ex = assertThrows(AppException.class, () -> authController.login(request));
        assertEquals(ErrorCode.ACCOUNT_LOCKED, ex.getErrorCode());
    }
}
