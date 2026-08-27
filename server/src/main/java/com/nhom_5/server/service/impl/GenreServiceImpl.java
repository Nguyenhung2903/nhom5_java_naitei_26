package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.GenreRequest;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.entity.Genre;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.GenreRepository;
import com.nhom_5.server.service.GenreService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GenreServiceImpl implements GenreService {

    private final GenreRepository genreRepository;

    @Override
    @Transactional(readOnly = true)
    public List<GenreResponse> getGenres(String keyword) {
        List<Genre> genres;
        if (StringUtils.hasText(keyword)) {
            genres = genreRepository.searchByKeyword(keyword.trim());
        } else {
            genres = genreRepository.findAll(Sort.by(Sort.Direction.ASC, "name"));
        }
        return genres.stream()
                .map(GenreResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public GenreResponse getGenreById(UUID id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));
        return GenreResponse.fromEntity(genre);
    }

    @Override
    @Transactional
    public GenreResponse createGenre(GenreRequest request) {
        String normalizedName = request.getName().trim();
        if (genreRepository.existsByNameIgnoreCase(normalizedName)) {
            throw new AppException(ErrorCode.GENRE_NAME_ALREADY_EXISTS);
        }

        String description = StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null;

        Genre genre = Genre.builder()
                .name(normalizedName)
                .description(description)
                .build();

        Genre saved = genreRepository.save(genre);
        return GenreResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public GenreResponse updateGenre(UUID id, GenreRequest request) {
        Genre existingGenre = genreRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));

        String normalizedName = request.getName().trim();
        if (genreRepository.existsByNameIgnoreCaseAndIdNot(normalizedName, id)) {
            throw new AppException(ErrorCode.GENRE_NAME_ALREADY_EXISTS);
        }

        existingGenre.setName(normalizedName);
        if (request.getDescription() != null) {
            existingGenre.setDescription(StringUtils.hasText(request.getDescription()) ? request.getDescription().trim() : null);
        }

        Genre updated = genreRepository.save(existingGenre);
        return GenreResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deleteGenre(UUID id) {
        Genre genre = genreRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.GENRE_NOT_FOUND));

        if (genre.getMovies() != null && !genre.getMovies().isEmpty()) {
            throw new AppException(ErrorCode.GENRE_IN_USE);
        }

        genreRepository.delete(genre);
    }
}
