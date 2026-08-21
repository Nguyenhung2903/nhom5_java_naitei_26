package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Theater;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface TheaterRepository extends JpaRepository<Theater, UUID> {
    boolean existsByNameIgnoreCase(String name);
    boolean existsByNameIgnoreCaseAndIdNot(String name, UUID id);

    @Query("""
            select distinct theater
            from Theater theater
            join Room room on room.theater = theater
            join Showtime showtime on showtime.room = room
            where showtime.movie.id = :movieId
            """)
    List<Theater> findAllByMovieId(@Param("movieId") UUID movieId);
}
