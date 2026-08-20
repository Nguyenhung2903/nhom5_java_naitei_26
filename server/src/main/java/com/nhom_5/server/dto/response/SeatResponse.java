package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Seat;
import com.nhom_5.server.entity.enums.SeatType;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class SeatResponse {
    private UUID id;
    private UUID roomId;
    private String roomName;
    private UUID theaterId;
    private String theaterName;
    private String seatRow;
    private Integer seatNumber;
    private SeatType seatType;

    public static SeatResponse fromEntity(Seat seat) {
        return SeatResponse.builder()
                .id(seat.getId())
                .roomId(seat.getRoom().getId())
                .roomName(seat.getRoom().getName())
                .theaterId(seat.getRoom().getTheater().getId())
                .theaterName(seat.getRoom().getTheater().getName())
                .seatRow(seat.getSeatRow())
                .seatNumber(seat.getSeatNumber())
                .seatType(seat.getSeatType())
                .build();
    }
}
