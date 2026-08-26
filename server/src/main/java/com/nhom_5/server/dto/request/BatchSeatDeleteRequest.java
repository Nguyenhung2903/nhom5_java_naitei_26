package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu yêu cầu xóa hàng loạt ghế")
public class BatchSeatDeleteRequest {

    @NotEmpty(message = "Danh sách ID ghế cần xóa không được để trống")
    @Schema(description = "Danh sách UUID các ghế cần xóa")
    private List<UUID> seatIds;
}
