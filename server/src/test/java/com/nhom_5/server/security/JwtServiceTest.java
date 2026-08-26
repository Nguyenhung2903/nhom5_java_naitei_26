package com.nhom_5.server.security;

import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        // Cung cấp secret key 256 bits mẫu và expiration ms
        ReflectionTestUtils.setField(jwtService, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtService, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Tạo và giải mã JWT token thành công")
    void testGenerateAndExtractToken() {
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("testuser")
                .email("testuser@example.com")
                .fullName("Test User")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        String token = jwtService.generateToken(user);
        assertNotNull(token);
        assertFalse(token.isEmpty());

        String extractedUsername = jwtService.extractUsername(token);
        assertEquals("testuser@example.com", extractedUsername);

        CustomUserDetails userDetails = new CustomUserDetails(user);
        assertTrue(jwtService.validateToken(token, userDetails));
        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    @DisplayName("Token không hợp lệ khi username không khớp")
    void testValidateTokenWithDifferentUsername() {
        User user1 = User.builder()
                .id(UUID.randomUUID())
                .username("user1")
                .email("user1@example.com")
                .fullName("User One")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        User user2 = User.builder()
                .id(UUID.randomUUID())
                .username("user2")
                .email("user2@example.com")
                .fullName("User Two")
                .role(Role.USER)
                .status(UserStatus.ACTIVE)
                .build();

        String token = jwtService.generateToken(user1);
        CustomUserDetails userDetails2 = new CustomUserDetails(user2);

        assertFalse(jwtService.validateToken(token, userDetails2));
    }
}
