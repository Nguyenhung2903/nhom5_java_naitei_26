package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ShowtimeRepository extends JpaRepository<Showtime, UUID> {
    boolean existsByRoomId(UUID roomId);

        @Query("""
                        select showtime
                        from Showtime showtime
                        where showtime.movie.id = :movieId
                            and showtime.room.theater.id = :theaterId
                            and showtime.startTime >= :startTime
                            and showtime.startTime < :endTime
                        order by showtime.startTime
                        """)
        List<Showtime> findAllByMovieIdAndTheaterIdAndStartTimeBetween(
                        @Param("movieId") UUID movieId,
                        @Param("theaterId") UUID theaterId,
                        @Param("startTime") Instant startTime,
                        @Param("endTime") Instant endTime);
}
