package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.ShowtimeStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
public class ShowtimeRequest {
    @NotNull(message = "ID phim không được để trống")
    private UUID movieId;

    @NotNull(message = "ID phòng không được để trống")
    private UUID roomId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    private Instant startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    private Instant endTime;

    @NotNull(message = "Trạng thái suất chiếu không được để trống")
    private ShowtimeStatus status;
}
