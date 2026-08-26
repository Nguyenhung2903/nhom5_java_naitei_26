package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.MovieRequest;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.dto.response.MovieResponse;
import com.nhom_5.server.entity.enums.MovieStatus;

import java.util.List;
import java.util.UUID;

public interface MovieService {

    List<GenreResponse> getGenres();

    List<MovieResponse> getMovies(String keyword, MovieStatus status, UUID genreId);

    MovieResponse getMovieById(UUID id);

    MovieResponse createMovie(MovieRequest request);

    MovieResponse updateMovie(UUID id, MovieRequest request);

    void deleteMovie(UUID id);
}
