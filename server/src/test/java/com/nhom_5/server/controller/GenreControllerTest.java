package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.GenreRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.UserStatus;
import com.nhom_5.server.repository.GenreRepository;
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

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@ActiveProfiles("test")
public class GenreControllerTest {

    @Autowired
    private GenreController genreController;

    @Autowired
    private GenreRepository genreRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private User adminUser;

    @BeforeEach
    void setup() {
        if (!userRepository.existsByUsername("testadmin_genre")) {
            adminUser = userRepository.save(User.builder()
                    .username("testadmin_genre")
                    .password(passwordEncoder.encode("Admin@123456"))
                    .email("testadmin_genre@cinemanest.vn")
                    .fullName("Genre Test Admin")
                    .role(Role.ADMIN)
                    .status(UserStatus.ACTIVE)
                    .build());
        } else {
            adminUser = userRepository.findByUsername("testadmin_genre").orElseThrow();
        }
    }

    private void authenticateAsAdmin() {
        CustomUserDetails userDetails = new CustomUserDetails(adminUser);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @Test
    @DisplayName("GET /genres should return list of genres")
    void getGenres_shouldReturnGenres() {
        ResponseEntity<ApiResponse<List<GenreResponse>>> response = genreController.getGenres(null);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertNotNull(response.getBody().getData());
    }

    @Test
    @DisplayName("POST /genres and PUT /genres/{id} should create and update genre with description")
    void createAndUpdateGenre_shouldSucceed() {
        authenticateAsAdmin();

        String uniqueName = "TestGenre-" + UUID.randomUUID().toString().substring(0, 8);
        GenreRequest createReq = GenreRequest.builder()
                .name(uniqueName)
                .description("Mô tả thể loại thử nghiệm")
                .build();

        ResponseEntity<ApiResponse<GenreResponse>> created = genreController.createGenre(createReq);
        assertEquals(HttpStatus.CREATED, created.getStatusCode());
        assertNotNull(created.getBody());
        GenreResponse createdGenre = created.getBody().getData();
        assertNotNull(createdGenre);
        assertEquals(uniqueName, createdGenre.getName());
        assertEquals("Mô tả thể loại thử nghiệm", createdGenre.getDescription());

        // Update
        GenreRequest updateReq = GenreRequest.builder()
                .name(uniqueName + "-Updated")
                .description("Mô tả cập nhật mới")
                .build();

        ResponseEntity<ApiResponse<GenreResponse>> updated = genreController.updateGenre(createdGenre.getId(), updateReq);
        assertEquals(HttpStatus.OK, updated.getStatusCode());
        assertNotNull(updated.getBody());
        assertEquals(uniqueName + "-Updated", updated.getBody().getData().getName());
        assertEquals("Mô tả cập nhật mới", updated.getBody().getData().getDescription());

        // Delete
        ResponseEntity<ApiResponse<Void>> deleted = genreController.deleteGenre(createdGenre.getId());
        assertEquals(HttpStatus.OK, deleted.getStatusCode());
    }
}
