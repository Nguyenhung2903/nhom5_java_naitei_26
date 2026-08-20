package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ShowtimeRepository extends JpaRepository<Showtime, UUID> {
    boolean existsByRoomId(UUID roomId);
}
