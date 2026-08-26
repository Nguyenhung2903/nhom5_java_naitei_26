package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.LoginRequest;
import com.nhom_5.server.dto.request.RegisterRequest;
import com.nhom_5.server.dto.response.AuthResponse;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.UserRepository;
import com.nhom_5.server.security.JwtService;
import com.nhom_5.server.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

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

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .id(UUID.randomUUID())
                .username("johndoe")
                .password("encodedPassword")
                .email("johndoe@example.com")
                .fullName("John Doe")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Đăng ký thành công tài khoản mới")
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .username("johndoe")
                .password("Password@123")
                .email("johndoe@example.com")
                .fullName("John Doe")
                .build();

        when(userRepository.existsByUsername("johndoe")).thenReturn(false);
        when(userRepository.existsByEmail("johndoe@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mocked.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("johndoe", response.getUser().getUsername());
        assertEquals(Role.USER, response.getUser().getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi username đã tồn tại")
    void testRegisterDuplicateUsername() {
        RegisterRequest request = RegisterRequest.builder()
                .username("johndoe")
                .password("Password@123")
                .email("johndoe@example.com")
                .fullName("John Doe")
                .build();

        when(userRepository.existsByUsername("johndoe")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> authService.register(request));
        assertEquals(ErrorCode.USERNAME_ALREADY_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi ngày sinh dưới 14 tuổi")
    void testRegisterUnder14YearsOld() {
        RegisterRequest request = RegisterRequest.builder()
                .username("younguser")
                .password("Password@123")
                .email("young@example.com")
                .fullName("Young User")
                .birthday(java.time.LocalDate.now().minusYears(10))
                .build();

        AppException ex = assertThrows(AppException.class, () -> authService.register(request));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Bạn phải từ đủ 14 tuổi trở lên để đăng ký tài khoản", ex.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thành công khi ngày sinh từ đủ 14 tuổi")
    void testRegisterExactly14YearsOld() {
        RegisterRequest request = RegisterRequest.builder()
                .username("fourteenuser")
                .password("Password@123")
                .email("fourteen@example.com")
                .fullName("Fourteen User")
                .birthday(java.time.LocalDate.now().minusYears(14))
                .build();

        when(userRepository.existsByUsername("fourteenuser")).thenReturn(false);
        when(userRepository.existsByEmail("fourteen@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password@123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("mocked.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng nhập thành công với Email")
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .email("johndoe@example.com")
                .password("Password@123")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(new UsernamePasswordAuthenticationToken(sampleUser.getEmail(), "Password@123"));
        when(userRepository.findByEmail("johndoe@example.com")).thenReturn(Optional.of(sampleUser));
        when(jwtService.generateToken(sampleUser)).thenReturn("mocked.jwt.token");
        when(jwtService.getExpirationMs()).thenReturn(604800000L);

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("mocked.jwt.token", response.getAccessToken());
        assertEquals("johndoe", response.getUser().getUsername());
        assertEquals("johndoe@example.com", response.getUser().getEmail());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
    void testLoginBadCredentials() {
        LoginRequest request = LoginRequest.builder()
                .email("johndoe@example.com")
                .password("WrongPassword")
                .build();

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        AppException ex = assertThrows(AppException.class, () -> authService.login(request));
        assertEquals(ErrorCode.INVALID_CREDENTIALS, ex.getErrorCode());
    }
}
