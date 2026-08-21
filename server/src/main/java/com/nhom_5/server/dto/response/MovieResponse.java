package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.entity.enums.MovieStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin phim")
public class MovieResponse {

    private UUID id;
    private String title;
    private String description;
    private Integer duration;
    private String director;
    private String castMembers;
    private String language;
    private String ageRating;
    private LocalDate releaseDate;
    private String poster;
    private String trailer;
    private MovieStatus status;
    private List<GenreResponse> genres;
    private Instant createdAt;
    private Instant updatedAt;

    public static MovieResponse fromEntity(Movie movie) {
        if (movie == null) {
            return null;
        }
        return MovieResponse.builder()
                .id(movie.getId())
                .title(movie.getTitle())
                .description(movie.getDescription())
                .duration(movie.getDuration())
                .director(movie.getDirector())
                .castMembers(movie.getCastMembers())
                .language(movie.getLanguage())
                .ageRating(movie.getAgeRating())
                .releaseDate(movie.getReleaseDate())
                .poster(movie.getPoster())
                .trailer(movie.getTrailer())
                .status(movie.getStatus())
                .genres(movie.getGenres().stream()
                        .map(GenreResponse::fromEntity)
                        .sorted(Comparator.comparing(GenreResponse::getName))
                        .toList())
                .createdAt(movie.getCreatedAt())
                .updatedAt(movie.getUpdatedAt())
                .build();
    }
}
