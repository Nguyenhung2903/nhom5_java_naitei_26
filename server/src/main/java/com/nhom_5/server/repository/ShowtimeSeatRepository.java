package com.nhom_5.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.nhom_5.server.entity.ShowtimeSeat;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.UUID;

@Repository
public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, UUID> {
    boolean existsBySeatId(UUID seatId);

    boolean existsBySeatIdAndStatusIn(UUID seatId,
            List<com.nhom_5.server.entity.enums.ShowtimeSeatStatus> statuses);

    boolean existsBySeatIdInAndStatusIn(List<UUID> seatIds,
            List<com.nhom_5.server.entity.enums.ShowtimeSeatStatus> statuses);

    @Modifying
    @Query("DELETE FROM ShowtimeSeat ss WHERE ss.seat.id = :seatId")
    void deleteBySeatId(@Param("seatId") UUID seatId);

    @Modifying
    @Query("DELETE FROM ShowtimeSeat ss WHERE ss.seat.id IN :seatIds")
    void deleteBySeatIdIn(@Param("seatIds") List<UUID> seatIds);

    List<ShowtimeSeat> findBySeatIdInAndStatus(List<UUID> seatIds,
            com.nhom_5.server.entity.enums.ShowtimeSeatStatus status);

    boolean existsByShowtimeId(UUID showtimeId);

    boolean existsByShowtimeIdAndStatusIn(UUID showtimeId,
            List<com.nhom_5.server.entity.enums.ShowtimeSeatStatus> statuses);

    @Modifying
    @Query("DELETE FROM ShowtimeSeat ss WHERE ss.showtime.id = :showtimeId")
    void deleteByShowtimeId(@Param("showtimeId") UUID showtimeId);

    @Query("""
            SELECT COUNT(ss) > 0
            FROM ShowtimeSeat ss
            WHERE (ss.showtime.id IN (SELECT st.id FROM Showtime st WHERE st.room.id = :roomId)
                   OR ss.seat.id IN (SELECT s.id FROM Seat s WHERE s.room.id = :roomId))
              AND ss.status IN :statuses
            """)
    boolean existsBookedOrHeldByRoomId(@Param("roomId") UUID roomId,
            @Param("statuses") List<com.nhom_5.server.entity.enums.ShowtimeSeatStatus> statuses);

    @Modifying
    @Query("""
            DELETE FROM ShowtimeSeat ss
            WHERE ss.showtime.id IN (SELECT st.id FROM Showtime st WHERE st.room.id = :roomId)
               OR ss.seat.id IN (SELECT s.id FROM Seat s WHERE s.room.id = :roomId)
            """)
    void deleteByRoomIdCascade(@Param("roomId") UUID roomId);

    // Lấy các ghế của 1 suất chiếu
    List<ShowtimeSeat> findByShowtimeId(UUID showtimeId);

    // Lấy + khóa các ghế theo ID
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT ss
            FROM ShowtimeSeat ss
            WHERE ss.id IN : ids
            """)
    List<ShowtimeSeat> findAllByIdForUpdate(@Param("ids") List<UUID> ids);

    // Lấy + khóa ghế theo ID + đảm bảo đúng Showtime
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT ss
            FROM ShowtimeSeat ss
            WHERE ss.showtime.id = :showtimeId
            AND ss.id IN :ids
            """)
    List<ShowtimeSeat> findByShowtimeIdAndIdsForUpdate(@Param("showtimeId") UUID showtimeId,
            @Param("ids") List<UUID> ids);

    List<ShowtimeSeat> findByStatus(com.nhom_5.server.entity.enums.ShowtimeSeatStatus status);
}
