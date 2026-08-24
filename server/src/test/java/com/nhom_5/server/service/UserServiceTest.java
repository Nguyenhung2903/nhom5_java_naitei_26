package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.AdminUpdateUserRequest;
import com.nhom_5.server.dto.request.CreateUserRequest;
import com.nhom_5.server.dto.request.UpdateProfileRequest;
import com.nhom_5.server.dto.response.PageResponse;
import com.nhom_5.server.dto.response.UserProfileDto;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import com.nhom_5.server.security.CustomUserDetails;
import com.nhom_5.server.service.impl.UserServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserServiceImpl userService;

    private User sampleUser;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleUser = User.builder()
                .id(sampleUserId)
                .username("john_doe")
                .password("encoded_password")
                .email("john@cinemanest.vn")
                .fullName("John Doe")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .phone("0912345678")
                .birthday(LocalDate.of(1995, 5, 20))
                .gender("Nam")
                .avatar("https://example.com/avatar.jpg")
                .build();

        CustomUserDetails userDetails = new CustomUserDetails(sampleUser);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("Lấy hồ sơ người dùng hiện tại thành công")
    void testGetCurrentProfile_Success() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        UserProfileDto result = userService.getCurrentProfile();

        assertNotNull(result);
        assertEquals("john_doe", result.getUsername());
        assertEquals("john@cinemanest.vn", result.getEmail());
        assertEquals("John Doe", result.getFullName());
    }

    @Test
    @DisplayName("Cập nhật hồ sơ cá nhân thành công")
    void testUpdateCurrentProfile_Success() {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .username("john_doe_new")
                .fullName("John Doe Updated")
                .phone("0987654321")
                .birthday(LocalDate.of(1996, 6, 21))
                .gender("Nam")
                .avatar("https://example.com/avatar_new.jpg")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(userRepository.existsByUsernameAndIdNot("john_doe_new", sampleUserId)).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileDto result = userService.updateCurrentProfile(request);

        assertNotNull(result);
        assertEquals("john_doe_new", result.getUsername());
        assertEquals("John Doe Updated", result.getFullName());
        assertEquals("0987654321", result.getPhone());
    }

    @Test
    @DisplayName("Cập nhật hồ sơ cá nhân thất bại khi username mới bị trùng")
    void testUpdateCurrentProfile_DuplicateUsername_ThrowsException() {
        UpdateProfileRequest request = UpdateProfileRequest.builder()
                .username("existing_user")
                .fullName("John Doe Updated")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(userRepository.existsByUsernameAndIdNot("existing_user", sampleUserId)).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> userService.updateCurrentProfile(request));
        assertEquals(ErrorCode.USERNAME_ALREADY_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Lấy danh sách người dùng có phân trang thành công")
    void testGetUsers_Success() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(Collections.singletonList(sampleUser), pageable, 1);

        when(userRepository.findAll(any(Specification.class), eq(pageable))).thenReturn(page);

        PageResponse<UserProfileDto> result = userService.getUsers("john", Role.USER, UserStatus.ACTIVE, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        assertEquals("john_doe", result.getContent().get(0).getUsername());
    }

    @Test
    @DisplayName("Lấy chi tiết người dùng theo ID thành công")
    void testGetUserById_Success() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        UserProfileDto result = userService.getUserById(sampleUserId);

        assertNotNull(result);
        assertEquals(sampleUserId, result.getId());
        assertEquals("john_doe", result.getUsername());
    }

    @Test
    @DisplayName("Lấy chi tiết người dùng thất bại khi ID không tồn tại")
    void testGetUserById_NotFound_ThrowsException() {
        UUID nonExistentId = UUID.randomUUID();
        when(userRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> userService.getUserById(nonExistentId));
        assertEquals(ErrorCode.USER_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("Admin tạo người dùng mới thành công")
    void testCreateUser_Success() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("new_admin")
                .email("newadmin@cinemanest.vn")
                .password("Password@123")
                .fullName("New Admin User")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.existsByUsername("new_admin")).thenReturn(false);
        when(userRepository.existsByEmail("newadmin@cinemanest.vn")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encoded_new_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        UserProfileDto result = userService.createUser(request);

        assertNotNull(result);
        assertEquals("new_admin", result.getUsername());
        assertEquals("newadmin@cinemanest.vn", result.getEmail());
        assertEquals(Role.ADMIN, result.getRole());
    }

    @Test
    @DisplayName("Admin tạo người dùng thất bại khi trùng username")
    void testCreateUser_DuplicateUsername_ThrowsException() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("john_doe")
                .email("other@cinemanest.vn")
                .password("Password@123")
                .fullName("John Doe")
                .build();

        when(userRepository.existsByUsername("john_doe")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> userService.createUser(request));
        assertEquals(ErrorCode.USERNAME_ALREADY_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin tạo người dùng thất bại khi trùng email")
    void testCreateUser_DuplicateEmail_ThrowsException() {
        CreateUserRequest request = CreateUserRequest.builder()
                .username("new_unique_user")
                .email("john@cinemanest.vn")
                .password("Password@123")
                .fullName("John Doe")
                .build();

        when(userRepository.existsByUsername("new_unique_user")).thenReturn(false);
        when(userRepository.existsByEmail("john@cinemanest.vn")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> userService.createUser(request));
        assertEquals(ErrorCode.EMAIL_ALREADY_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Admin cập nhật người dùng thành công kèm đổi mật khẩu")
    void testUpdateUser_Admin_Success() {
        AdminUpdateUserRequest request = AdminUpdateUserRequest.builder()
                .username("john_doe_updated")
                .fullName("John Doe Admin Updated")
                .role(Role.ADMIN)
                .status(UserStatus.ACTIVE)
                .password("NewSecretPassword@123")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(userRepository.existsByUsernameAndIdNot("john_doe_updated", sampleUserId)).thenReturn(false);
        when(passwordEncoder.encode("NewSecretPassword@123")).thenReturn("new_encoded_password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserProfileDto result = userService.updateUser(sampleUserId, request);

        assertNotNull(result);
        assertEquals("john_doe_updated", result.getUsername());
        assertEquals("John Doe Admin Updated", result.getFullName());
        assertEquals(Role.ADMIN, result.getRole());
        verify(passwordEncoder, times(1)).encode("NewSecretPassword@123");
    }

    @Test
    @DisplayName("Admin xóa mềm người dùng (chuyển status sang LOCKED) thành công")
    void testDeleteUser_SoftDelete_Success() {
        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        userService.deleteUser(sampleUserId);

        assertEquals(UserStatus.LOCKED, sampleUser.getStatus());
        verify(userRepository, times(1)).save(sampleUser);
    }
}
