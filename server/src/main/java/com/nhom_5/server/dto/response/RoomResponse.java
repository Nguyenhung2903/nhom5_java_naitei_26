package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Room;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RoomResponse {
    private UUID id;
    private UUID theaterId;
    private String theaterName;
    private String name;

    public static RoomResponse fromEntity(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .theaterId(room.getTheater().getId())
                .theaterName(room.getTheater().getName())
                .name(room.getName())
                .build();
    }
}
