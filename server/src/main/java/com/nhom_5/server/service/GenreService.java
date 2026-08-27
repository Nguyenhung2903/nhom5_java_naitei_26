package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.GenreRequest;
import com.nhom_5.server.dto.response.GenreResponse;

import java.util.List;
import java.util.UUID;

public interface GenreService {

    List<GenreResponse> getGenres(String keyword);

    GenreResponse getGenreById(UUID id);

    GenreResponse createGenre(GenreRequest request);

    GenreResponse updateGenre(UUID id, GenreRequest request);

    void deleteGenre(UUID id);
}
