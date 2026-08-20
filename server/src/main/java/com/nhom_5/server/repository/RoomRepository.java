package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RoomRepository extends JpaRepository<Room, UUID> {
    boolean existsByTheaterIdAndNameIgnoreCase(UUID theaterId, String name);
    boolean existsByTheaterIdAndNameIgnoreCaseAndIdNot(UUID theaterId, String name, UUID id);
    boolean existsByTheaterId(UUID theaterId);
}
