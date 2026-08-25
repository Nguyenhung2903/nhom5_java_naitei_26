package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Schema(description = "Dữ liệu yêu cầu giữ ghế tạm thời")
public class HoldSeatsRequest {

    @NotEmpty(message = "Danh sách ghế không được để trống")
    @Schema(description = "Danh sách ID ghế cần giữ tạm thời", example = "[\"55555555-5555-5555-5555-555555555551\", \"55555555-5555-5555-5555-555555555552\"]")
    private List<UUID> seatIds;
}
