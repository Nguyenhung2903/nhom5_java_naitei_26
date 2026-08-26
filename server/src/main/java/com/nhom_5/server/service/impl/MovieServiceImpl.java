package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.MovieRequest;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.dto.response.MovieResponse;
import com.nhom_5.server.entity.Genre;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.entity.enums.MovieStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.GenreRepository;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.service.MovieService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> getGenres() {
        return genreRepository.findAll(Sort.by(Sort.Direction.ASC, "name")).stream()
                .map(GenreResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getMovies(String keyword, MovieStatus status, UUID genreId) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        List<Movie> movies;
        if (normalizedKeyword != null && status != null) {
            movies = movieRepository.searchByKeywordAndStatus(normalizedKeyword, status);
        } else if (normalizedKeyword != null) {
            movies = movieRepository.searchByKeyword(normalizedKeyword);
        } else if (status != null) {
            movies = movieRepository.findByStatusOrderByReleaseDateDescCreatedAtDesc(status);
        } else {
            movies = movieRepository.findAllByOrderByReleaseDateDescCreatedAtDesc();
        }

        if (genreId != null) {
            movies = movies.stream()
                    .filter(m -> m.getGenres() != null && m.getGenres().stream().anyMatch(g -> genreId.equals(g.getId())))
                    .toList();
        }

        return movies.stream()
                .map(MovieResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(UUID id) {
        return MovieResponse.fromEntity(findMovie(id));
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        Movie movie = Movie.builder().build();
        applyRequest(movie, request);
        return MovieResponse.fromEntity(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(UUID id, MovieRequest request) {
        Movie movie = findMovie(id);
        applyRequest(movie, request);
        return MovieResponse.fromEntity(movieRepository.save(movie));
    }

    @Override
    @Transactional
    public void deleteMovie(UUID id) {
        Movie movie = findMovie(id);
        movieRepository.delete(movie);
    }

    private Movie findMovie(UUID id) {
        return movieRepository.findWithGenresById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + id));
    }

    private void applyRequest(Movie movie, MovieRequest request) {
        movie.setTitle(request.getTitle().trim());
        movie.setDescription(trimToNull(request.getDescription()));
        movie.setDuration(request.getDuration());
        movie.setDirector(trimToNull(request.getDirector()));
        movie.setCastMembers(trimToNull(request.getCastMembers()));
        movie.setLanguage(trimToNull(request.getLanguage()));
        movie.setAgeRating(trimToNull(request.getAgeRating()));
        movie.setReleaseDate(request.getReleaseDate());
        movie.setPoster(trimToNull(request.getPoster()));
        movie.setTrailer(trimToNull(request.getTrailer()));
        movie.setStatus(request.getStatus());
        movie.setGenres(resolveGenres(request.getGenreIds()));
    }

    private Set<Genre> resolveGenres(Set<UUID> genreIds) {
        if (genreIds == null || genreIds.isEmpty()) {
            return new HashSet<>();
        }

        Set<UUID> distinctIds = new HashSet<>(genreIds);
        List<Genre> genres = genreRepository.findAllById(distinctIds);
        if (genres.size() != distinctIds.size()) {
            throw new AppException(ErrorCode.NOT_FOUND, "Một hoặc nhiều thể loại phim không tồn tại");
        }

        return new HashSet<>(genres);
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
