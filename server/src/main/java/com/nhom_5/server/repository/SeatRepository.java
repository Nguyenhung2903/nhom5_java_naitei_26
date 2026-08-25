package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SeatRepository extends JpaRepository<Seat, UUID> {
    boolean existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(UUID roomId, String seatRow, Integer seatNumber);
    boolean existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumberAndIdNot(UUID roomId, String seatRow, Integer seatNumber, UUID id);
    boolean existsByRoomId(UUID roomId);
    List<Seat> findByRoomIdOrderBySeatRowAscSeatNumberAsc(UUID roomId);
}

