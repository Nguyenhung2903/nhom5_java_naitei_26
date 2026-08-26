package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Showtime;
import com.nhom_5.server.entity.enums.ShowtimeStatus;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
public class ShowtimeResponse {
    private UUID id;
    private UUID movieId;
    private String movieTitle;
    private UUID roomId;
    private String roomName;
    private UUID theaterId;
    private String theaterName;
    private Instant startTime;
    private Instant endTime;
    private ShowtimeStatus status;

    public static ShowtimeResponse fromEntity(Showtime showtime) {
        ShowtimeStatus effectiveStatus = showtime.getStatus();
        if (effectiveStatus == ShowtimeStatus.OPEN && showtime.getEndTime() != null && showtime.getEndTime().isBefore(Instant.now())) {
            effectiveStatus = ShowtimeStatus.FINISHED;
        }

        return ShowtimeResponse.builder()
                .id(showtime.getId())
                .movieId(showtime.getMovie().getId())
                .movieTitle(showtime.getMovie().getTitle())
                .roomId(showtime.getRoom().getId())
                .roomName(showtime.getRoom().getName())
                .theaterId(showtime.getRoom().getTheater().getId())
                .theaterName(showtime.getRoom().getTheater().getName())
                .startTime(showtime.getStartTime())
                .endTime(showtime.getEndTime())
                .status(effectiveStatus)
                .build();
    }
}
