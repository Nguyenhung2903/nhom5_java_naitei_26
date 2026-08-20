package com.nhom_5.server.repository;

import com.nhom_5.server.entity.ShowtimeSeat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShowtimeSeatRepository extends JpaRepository<ShowtimeSeat, UUID> {
    boolean existsByShowtimeId(UUID showtimeId);
    boolean existsBySeatId(UUID seatId);
}
