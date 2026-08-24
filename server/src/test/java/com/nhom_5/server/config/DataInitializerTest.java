package com.nhom_5.server.config;

import com.nhom_5.server.entity.Genre;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.repository.GenreRepository;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.repository.NewsRepository;
import com.nhom_5.server.repository.PromotionRepository;
import com.nhom_5.server.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DataInitializerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GenreRepository genreRepository;

    @Mock
    private MovieRepository movieRepository;

    @Mock
    private NewsRepository newsRepository;

    @Mock
    private PromotionRepository promotionRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DataInitializer dataInitializer;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(dataInitializer, "initAdminEnabled", true);
        ReflectionTestUtils.setField(dataInitializer, "adminUsername", "admin");
        ReflectionTestUtils.setField(dataInitializer, "adminPassword", "Admin@123456");
        ReflectionTestUtils.setField(dataInitializer, "adminEmail", "admin@cinemanest.vn");
        ReflectionTestUtils.setField(dataInitializer, "adminFullName", "System Administrator");

        lenient().when(passwordEncoder.encode(anyString())).thenReturn("encodedPassword");
        lenient().when(genreRepository.findByNameIgnoreCase(anyString()))
                .thenAnswer(invocation -> Optional.of(Genre.builder().name(invocation.getArgument(0)).build()));
    }

    @Test
    @DisplayName("Should not initialize any data when auto-initialization is disabled")
    void run_whenDisabled_shouldNotInitializeAnything() {
        ReflectionTestUtils.setField(dataInitializer, "initAdminEnabled", false);

        dataInitializer.run();

        verifyNoInteractions(userRepository);
        verifyNoInteractions(movieRepository);
    }

    @Test
    @DisplayName("Should create both Admin and Test user when database is fresh")
    void run_whenFreshDatabase_shouldCreateAdminAndTestUser() {
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByRole(Role.ADMIN)).thenReturn(false);

        dataInitializer.run();

        // 1 admin user + 1 test user
        verify(userRepository, times(2)).save(any(User.class));
    }

    @Test
    @DisplayName("Should skip test user creation when test user email already exists")
    void run_whenTestUserEmailAlreadyExists_shouldSkipTestUserCreation() {
        // Admin does not exist
        when(userRepository.existsByUsername("admin")).thenReturn(false);
        when(userRepository.existsByEmail("admin@cinemanest.vn")).thenReturn(false);
        when(userRepository.existsByRole(Role.ADMIN)).thenReturn(false);

        // Test user username does not exist, BUT email exists
        when(userRepository.existsByUsername("user")).thenReturn(false);
        when(userRepository.existsByEmail("user@cinemanest.vn")).thenReturn(true);

        dataInitializer.run();

        // Only admin should be saved, test user skipped without throwing exception
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Should skip admin user creation when admin email or role ADMIN already exists")
    void run_whenAdminAlreadyExists_shouldSkipAdminCreation() {
        // Admin already exists by email
        when(userRepository.existsByUsername("admin")).thenReturn(false);
        when(userRepository.existsByEmail("admin@cinemanest.vn")).thenReturn(true);

        // Test user does not exist
        when(userRepository.existsByUsername("user")).thenReturn(false);
        when(userRepository.existsByEmail("user@cinemanest.vn")).thenReturn(false);

        dataInitializer.run();

        // Only test user should be saved
        verify(userRepository, times(1)).save(any(User.class));
    }
}
