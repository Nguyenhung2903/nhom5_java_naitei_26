package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {
    boolean existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(UUID roomId, String seatRow, Integer seatNumber);
    boolean existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumberAndIdNot(UUID roomId, String seatRow, Integer seatNumber, UUID id);
    boolean existsByRoomId(UUID roomId);
    List<Seat> findByRoomIdOrderBySeatRowAscSeatNumberAsc(UUID roomId);

    @Modifying
    @Query("DELETE FROM Seat s WHERE s.room.id = :roomId")
    void deleteByRoomId(@Param("roomId") UUID roomId);
}


