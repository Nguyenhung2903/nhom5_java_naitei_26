package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.ShowtimeStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.Instant;
import java.util.UUID;

@Data
@Schema(description = "Dữ liệu tạo hoặc cập nhật suất chiếu")
public class ShowtimeRequest {

    @NotNull(message = "ID phim không được để trống")
    @Schema(description = "ID phim cần lên lịch chiếu", example = "33333333-3333-3333-3333-333333333333")
    private UUID movieId;

    @NotNull(message = "ID phòng không được để trống")
    @Schema(description = "ID phòng chiếu diễn ra suất chiếu", example = "22222222-2222-2222-2222-222222222222")
    private UUID roomId;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @Schema(description = "Thời gian bắt đầu suất chiếu (UTC)", example = "2026-09-01T19:00:00Z")
    private Instant startTime;

    @NotNull(message = "Trạng thái suất chiếu không được để trống")
    @Schema(description = "Trạng thái suất chiếu: SCHEDULED (Đã lên lịch), CANCELLED (Hủy)", example = "SCHEDULED")
    private ShowtimeStatus status;
}
