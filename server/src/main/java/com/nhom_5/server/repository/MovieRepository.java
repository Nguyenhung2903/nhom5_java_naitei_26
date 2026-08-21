package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.entity.enums.MovieStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MovieRepository extends JpaRepository<Movie, UUID> {
    boolean existsByTitleIgnoreCase(String title);

    @Query("""
            SELECT DISTINCT m
            FROM Movie m
            LEFT JOIN FETCH m.genres g
            WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(m.director) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY m.releaseDate DESC, m.createdAt DESC
            """)
    List<Movie> searchByKeyword(@Param("keyword") String keyword);

    @Query("""
            SELECT DISTINCT m
            FROM Movie m
            LEFT JOIN FETCH m.genres g
            WHERE m.status = :status
              AND (
                LOWER(m.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(m.director) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(g.name) LIKE LOWER(CONCAT('%', :keyword, '%'))
              )
            ORDER BY m.releaseDate DESC, m.createdAt DESC
            """)
    List<Movie> searchByKeywordAndStatus(@Param("keyword") String keyword, @Param("status") MovieStatus status);

    @Query("""
            SELECT DISTINCT m
            FROM Movie m
            LEFT JOIN FETCH m.genres
            WHERE m.status = :status
            ORDER BY m.releaseDate DESC, m.createdAt DESC
            """)
    List<Movie> findByStatusOrderByReleaseDateDescCreatedAtDesc(@Param("status") MovieStatus status);

    @Query("""
            SELECT DISTINCT m
            FROM Movie m
            LEFT JOIN FETCH m.genres
            ORDER BY m.releaseDate DESC, m.createdAt DESC
            """)
    List<Movie> findAllByOrderByReleaseDateDescCreatedAtDesc();

    @Query("""
            SELECT m
            FROM Movie m
            LEFT JOIN FETCH m.genres
            WHERE m.id = :id
            """)
    Optional<Movie> findWithGenresById(@Param("id") UUID id);
}
