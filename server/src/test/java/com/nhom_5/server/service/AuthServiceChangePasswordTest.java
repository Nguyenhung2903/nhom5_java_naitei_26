package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ChangePasswordRequest;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import com.nhom_5.server.security.CustomUserDetails;
import com.nhom_5.server.security.JwtService;
import com.nhom_5.server.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceChangePasswordTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;
    private UUID sampleUserId;

    @BeforeEach
    void setUp() {
        sampleUserId = UUID.randomUUID();
        sampleUser = User.builder()
                .id(sampleUserId)
                .username("johndoe")
                .password("encoded_old_password")
                .email("johndoe@cinemanest.vn")
                .fullName("John Doe")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
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
    @DisplayName("Đổi mật khẩu thành công khi dữ liệu hợp lệ")
    void testChangePasswordSuccess() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword@123")
                .newPassword("NewPassword@123")
                .confirmPassword("NewPassword@123")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("OldPassword@123", "encoded_old_password")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword@123", "encoded_old_password")).thenReturn(false);
        when(passwordEncoder.encode("NewPassword@123")).thenReturn("encoded_new_password");

        authService.changePassword(request);

        assertEquals("encoded_new_password", sampleUser.getPassword());
        verify(userRepository, times(1)).save(sampleUser);
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi tài khoản bị khóa")
    void testChangePasswordAccountLocked() {
        sampleUser.setStatus(UserStatus.LOCKED);
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword@123")
                .newPassword("NewPassword@123")
                .confirmPassword("NewPassword@123")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));

        AppException ex = assertThrows(AppException.class, () -> authService.changePassword(request));
        assertEquals(ErrorCode.ACCOUNT_LOCKED, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi mật khẩu hiện tại không chính xác")
    void testChangePasswordIncorrectCurrentPassword() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("WrongPassword@123")
                .newPassword("NewPassword@123")
                .confirmPassword("NewPassword@123")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("WrongPassword@123", "encoded_old_password")).thenReturn(false);

        AppException ex = assertThrows(AppException.class, () -> authService.changePassword(request));
        assertEquals(ErrorCode.OLD_PASSWORD_INCORRECT, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi mật khẩu mới trùng mật khẩu hiện tại")
    void testChangePasswordSameAsOldPassword() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword@123")
                .newPassword("OldPassword@123")
                .confirmPassword("OldPassword@123")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("OldPassword@123", "encoded_old_password")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> authService.changePassword(request));
        assertEquals(ErrorCode.NEW_PASSWORD_SAME_AS_OLD, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đổi mật khẩu thất bại khi xác nhận mật khẩu không khớp")
    void testChangePasswordConfirmMismatch() {
        ChangePasswordRequest request = ChangePasswordRequest.builder()
                .currentPassword("OldPassword@123")
                .newPassword("NewPassword@123")
                .confirmPassword("DifferentPassword@123")
                .build();

        when(userRepository.findById(sampleUserId)).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("OldPassword@123", "encoded_old_password")).thenReturn(true);
        when(passwordEncoder.matches("NewPassword@123", "encoded_old_password")).thenReturn(false);

        AppException ex = assertThrows(AppException.class, () -> authService.changePassword(request));
        assertEquals(ErrorCode.PASSWORDS_DO_NOT_MATCH, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }
}
