package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
@Schema(description = "Dữ liệu tạo hoặc cập nhật phòng chiếu")
public class RoomRequest {

    @NotNull(message = "ID rạp không được để trống")
    @Schema(description = "ID cụm rạp sở hữu phòng chiếu", example = "11111111-1111-1111-1111-111111111111")
    private UUID theaterId;

    @NotBlank(message = "Tên phòng không được để trống")
    @Size(max = 255, message = "Tên phòng không được vượt quá 255 ký tự")
    @Schema(description = "Tên phòng chiếu", example = "Phòng chiếu 01 - IMAX")
    private String name;
}
