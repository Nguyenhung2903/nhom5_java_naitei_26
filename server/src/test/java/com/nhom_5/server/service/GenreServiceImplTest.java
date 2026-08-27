package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.GenreRequest;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.entity.Genre;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.GenreRepository;
import com.nhom_5.server.service.impl.GenreServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class GenreServiceImplTest {

    @Mock
    private GenreRepository genreRepository;

    @InjectMocks
    private GenreServiceImpl genreService;

    @Test
    @DisplayName("Should create genre successfully when name is unique")
    void createGenre_success() {
        GenreRequest request = GenreRequest.builder()
                .name("  Hành Động  ")
                .description("  Phim hành động kịch tính  ")
                .build();

        when(genreRepository.existsByNameIgnoreCase("Hành Động")).thenReturn(false);
        when(genreRepository.save(any(Genre.class))).thenAnswer(invocation -> {
            Genre g = invocation.getArgument(0);
            g.setId(UUID.randomUUID());
            return g;
        });

        GenreResponse response = genreService.createGenre(request);

        assertNotNull(response);
        assertEquals("Hành Động", response.getName());
        assertEquals("Phim hành động kịch tính", response.getDescription());
    }

    @Test
    @DisplayName("Should throw exception when creating genre with duplicate name")
    void createGenre_duplicateName_throwsException() {
        GenreRequest request = GenreRequest.builder()
                .name("Hành Động")
                .build();

        when(genreRepository.existsByNameIgnoreCase("Hành Động")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> genreService.createGenre(request));
        assertEquals(ErrorCode.GENRE_NAME_ALREADY_EXISTS, ex.getErrorCode());
        verify(genreRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update genre successfully even when genre has linked movies")
    void updateGenre_success_withLinkedMovies() {
        UUID id = UUID.randomUUID();
        Set<Movie> movies = new HashSet<>();
        movies.add(Movie.builder().id(UUID.randomUUID()).title("Fast & Furious").build());

        Genre existing = Genre.builder()
                .id(id)
                .name("Hành động cũ")
                .description("Mô tả cũ")
                .movies(movies)
                .build();

        GenreRequest request = GenreRequest.builder()
                .name("  Hành Động Mới  ")
                .description("  Mô tả mới  ")
                .build();

        when(genreRepository.findById(id)).thenReturn(Optional.of(existing));
        when(genreRepository.existsByNameIgnoreCaseAndIdNot("Hành Động Mới", id)).thenReturn(false);
        when(genreRepository.save(any(Genre.class))).thenAnswer(inv -> inv.getArgument(0));

        GenreResponse response = genreService.updateGenre(id, request);

        assertNotNull(response);
        assertEquals("Hành Động Mới", response.getName());
        assertEquals("Mô tả mới", response.getDescription());
        assertEquals(1, response.getMovieCount());
    }

    @Test
    @DisplayName("Should throw exception when updating genre to a duplicate name")
    void updateGenre_duplicateName_throwsException() {
        UUID id = UUID.randomUUID();
        Genre existing = Genre.builder()
                .id(id)
                .name("Hài")
                .build();

        GenreRequest request = GenreRequest.builder()
                .name("Kinh dị")
                .build();

        when(genreRepository.findById(id)).thenReturn(Optional.of(existing));
        when(genreRepository.existsByNameIgnoreCaseAndIdNot("Kinh dị", id)).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> genreService.updateGenre(id, request));
        assertEquals(ErrorCode.GENRE_NAME_ALREADY_EXISTS, ex.getErrorCode());
    }

    @Test
    @DisplayName("Should delete genre successfully when movieCount is 0")
    void deleteGenre_success_whenNoMovies() {
        UUID id = UUID.randomUUID();
        Genre existing = Genre.builder()
                .id(id)
                .name("Thể loại thử nghiệm")
                .movies(new HashSet<>())
                .build();

        when(genreRepository.findById(id)).thenReturn(Optional.of(existing));

        genreService.deleteGenre(id);

        verify(genreRepository).delete(existing);
    }

    @Test
    @DisplayName("Should reject genre deletion when genre is assigned to movies")
    void deleteGenre_reject_whenGenreInUse() {
        UUID id = UUID.randomUUID();
        Set<Movie> movies = new HashSet<>();
        movies.add(Movie.builder().id(UUID.randomUUID()).title("Avengers").build());

        Genre existing = Genre.builder()
                .id(id)
                .name("Hành động")
                .movies(movies)
                .build();

        when(genreRepository.findById(id)).thenReturn(Optional.of(existing));

        AppException ex = assertThrows(AppException.class, () -> genreService.deleteGenre(id));
        assertEquals(ErrorCode.GENRE_IN_USE, ex.getErrorCode());
        verify(genreRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should return all genres with search keyword")
    void getGenres_withKeyword() {
        when(genreRepository.searchByKeyword("hành")).thenReturn(List.of(
                Genre.builder().id(UUID.randomUUID()).name("Hành động").description("Phim hành động").build()
        ));

        List<GenreResponse> result = genreService.getGenres("hành");

        assertEquals(1, result.size());
        assertEquals("Hành động", result.get(0).getName());
        assertEquals("Phim hành động", result.get(0).getDescription());
    }
}
