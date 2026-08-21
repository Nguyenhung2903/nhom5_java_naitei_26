package com.nhom_5.server.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
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

    boolean existsByShowtimeId(UUID showtimeId);

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

}
