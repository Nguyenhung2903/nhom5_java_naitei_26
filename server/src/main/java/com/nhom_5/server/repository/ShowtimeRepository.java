package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ShowtimeRepository extends JpaRepository<Showtime, UUID>, JpaSpecificationExecutor<Showtime> {
    boolean existsByRoomId(UUID roomId);
    List<Showtime> findByRoomId(UUID roomId);
    List<Showtime> findByRoomIdAndStatusAndStartTimeAfter(UUID roomId, com.nhom_5.server.entity.enums.ShowtimeStatus status, Instant startTime);

    @Modifying
    @Query("DELETE FROM Showtime s WHERE s.room.id = :roomId")
    void deleteByRoomId(@Param("roomId") UUID roomId);

    @Query("""
            select count(showtime) > 0
            from Showtime showtime
            where showtime.room.id = :roomId
                and (:excludedId is null or showtime.id <> :excludedId)
                and showtime.startTime < :newEndTime
                and showtime.endTime > :newStartTime
            """)
    boolean existsOverlappingShowtime(
            @Param("roomId") UUID roomId,
            @Param("newStartTime") Instant newStartTime,
            @Param("newEndTime") Instant newEndTime,
            @Param("excludedId") UUID excludedId);

    @Query("""
            select showtime
            from Showtime showtime
            join fetch showtime.room room
            join fetch room.theater theater
            join fetch showtime.movie movie
            where showtime.movie.id = :movieId
                and room.theater.id = :theaterId
                and showtime.startTime >= :startTime
                and showtime.startTime < :endTime
            order by showtime.startTime
            """)
    List<Showtime> findAllByMovieIdAndTheaterIdAndStartTimeBetween(
            @Param("movieId") UUID movieId,
            @Param("theaterId") UUID theaterId,
            @Param("startTime") Instant startTime,
            @Param("endTime") Instant endTime);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("UPDATE Showtime s SET s.status = :newStatus WHERE s.status = :oldStatus AND s.endTime <= :now")
    int updateStatusByEndTimeBeforeAndStatus(
            @Param("oldStatus") com.nhom_5.server.entity.enums.ShowtimeStatus oldStatus,
            @Param("newStatus") com.nhom_5.server.entity.enums.ShowtimeStatus newStatus,
            @Param("now") Instant now);
}
