package com.nhom_5.server.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class RoomRequest {
    @NotNull(message = "ID rạp không được để trống")
    private UUID theaterId;

    @NotBlank(message = "Tên phòng không được để trống")
    @Size(max = 255, message = "Tên phòng không được vượt quá 255 ký tự")
    private String name;
}
