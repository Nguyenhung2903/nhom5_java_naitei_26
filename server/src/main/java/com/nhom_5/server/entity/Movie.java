package com.nhom_5.server.entity;

import com.nhom_5.server.entity.enums.MovieStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "movie")
public class Movie extends BaseEntity {

    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "duration", nullable = false)
    private Integer duration;

    @Column(name = "director")
    private String director;

    @Column(name = "cast_members", columnDefinition = "TEXT")
    private String castMembers;

    @Column(name = "language")
    private String language;

    @Column(name = "age_rating")
    private String ageRating;

    @Column(name = "release_date")
    private LocalDate releaseDate;

    @Column(name = "poster", columnDefinition = "TEXT")
    private String poster;

    @Column(name = "trailer", columnDefinition = "TEXT")
    private String trailer;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status", nullable = false)
    private MovieStatus status = MovieStatus.COMING_SOON;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "movie_genre",
        joinColumns = @JoinColumn(name = "movie_id"),
        inverseJoinColumns = @JoinColumn(name = "genre_id")
    )
    @Builder.Default
    private Set<Genre> genres = new HashSet<>();
}
