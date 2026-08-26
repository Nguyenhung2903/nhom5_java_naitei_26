package com.nhom_5.server.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nhom_5.server.dto.request.AdminUpdateUserRequest;
import com.nhom_5.server.dto.request.CreateUserRequest;
import com.nhom_5.server.dto.request.UpdateProfileRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.AuthResponse;
import com.nhom_5.server.dto.response.PageResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import com.nhom_5.server.security.CustomUserDetails;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class UserControllerTest {

    @Autowired
    private UserController userController;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User standardUser;
    private User adminUser;

    @BeforeEach
    void setup() {
        userRepository.deleteAll();

        // 1. Tạo tài khoản User thông thường
        standardUser = User.builder()
                .username("user01")
                .password(passwordEncoder.encode("User@123456"))
                .email("user01@cinemanest.vn")
                .fullName("Standard User")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .phone("0912345678")
                .birthday(LocalDate.of(2000, 1, 1))
                .gender("Nam")
                .build();
        standardUser = userRepository.save(standardUser);

        // 2. Tạo tài khoản Admin
        adminUser = User.builder()
                .username("admin01")
                .password(passwordEncoder.encode("Admin@123456"))
                .email("admin01@cinemanest.vn")
                .fullName("Admin User")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .phone("0987654321")
                .birthday(LocalDate.of(1990, 1, 1))
                .gender("Nam")
                .build();
        adminUser = userRepository.save(adminUser);
    }

    private void authenticateAs(User user) {
        CustomUserDetails userDetails = new CustomUserDetails(user);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("Lấy thông tin hồ sơ của chính mình (/users/me)")
    void testGetCurrentProfile_Success() {
        authenticateAs(standardUser);

        ResponseEntity<ApiResponse<UserProfileDto>> response = userController.getCurrentProfile();

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("user01", response.getBody().getData().getUsername());
        assertEquals("user01@cinemanest.vn", response.getBody().getData().getEmail());
    }

    @Test
    @DisplayName("Cập nhật hồ sơ cá nhân thành công (/users/me)")
    void testUpdateCurrentProfile_Success() {
        authenticateAs(standardUser);

        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .username("user01_updated")
                .fullName("Standard User Updated")
                .phone("0933333333")
                .birthday(LocalDate.of(2001, 2, 2))
                .gender("Nữ")
                .avatar("https://example.com/new_avatar.jpg")
                .build();

        ResponseEntity<ApiResponse<AuthResponse>> response = userController.updateCurrentProfile(request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getData().getAccessToken());
        assertEquals("user01_updated", response.getBody().getData().getUser().getUsername());
        assertEquals("Standard User Updated", response.getBody().getData().getUser().getFullName());
        assertEquals("0933333333", response.getBody().getData().getUser().getPhone());
    }

    @Test
    @DisplayName("Admin lấy danh sách người dùng có phân trang và lọc (/users)")
    void testGetUsers_Success() {
        authenticateAs(adminUser);

        ResponseEntity<ApiResponse<PageResponse<UserProfileDto>>> response =
                userController.getUsers("user01", Role.USER, UserStatus.ACTIVE, 0, 10, "createdAt", "desc");

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody().getData());
        assertEquals(1, response.getBody().getData().getTotalElements());
        assertEquals("user01", response.getBody().getData().getContent().get(0).getUsername());
    }

    @Test
    @DisplayName("Admin lấy chi tiết người dùng theo ID (/users/{id})")
    void testGetUserById_Success() {
        authenticateAs(adminUser);

        ResponseEntity<ApiResponse<UserProfileDto>> response = userController.getUserById(standardUser.getId());

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("user01", response.getBody().getData().getUsername());
    }

    @Test
    @DisplayName("Admin tạo người dùng mới thành công (POST /users)")
    void testCreateUser_Success() {
        authenticateAs(adminUser);

        CreateUserRequest request = CreateUserRequest.builder()
                .username("staff_new")
                .email("staff_new@cinemanest.vn")
                .password("Staff@123456")
                .fullName("New Staff Member")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .phone("0944444444")
                .build();

        ResponseEntity<ApiResponse<UserProfileDto>> response = userController.createUser(request);

        assertNotNull(response);
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody().getData().getId());
        assertEquals("staff_new", response.getBody().getData().getUsername());
        assertEquals("staff_new@cinemanest.vn", response.getBody().getData().getEmail());
    }

    @Test
    @DisplayName("Admin cập nhật người dùng thành công (PUT /users/{id})")
    void testUpdateUser_Success() {
        authenticateAs(adminUser);

        AdminUpdateUserRequest request = AdminUpdateUserRequest.builder()
                .username("user01_promoted")
                .fullName("Promoted User")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .phone("0912345678")
                .build();

        ResponseEntity<ApiResponse<UserProfileDto>> response = userController.updateUser(standardUser.getId(), request);

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("user01_promoted", response.getBody().getData().getUsername());
        assertEquals(Role.ADMIN, response.getBody().getData().getRole());
    }

    @Test
    @DisplayName("Admin xóa mềm / khóa tài khoản người dùng thành công (DELETE /users/{id})")
    void testDeleteUser_Success() {
        authenticateAs(adminUser);

        ResponseEntity<ApiResponse<Void>> response = userController.deleteUser(standardUser.getId());

        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());

        User lockedUser = userRepository.findById(standardUser.getId()).orElseThrow();
        assertEquals(UserStatus.LOCKED, lockedUser.getStatus());
    }
}
