package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.SeatType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class SeatRequest {
    @NotNull(message = "ID phòng không được để trống")
    private UUID roomId;

    @NotBlank(message = "Hàng ghế không được để trống")
    @Size(max = 10, message = "Hàng ghế không được vượt quá 10 ký tự")
    private String seatRow;

    @NotNull(message = "Số ghế không được để trống")
    @Positive(message = "Số ghế phải lớn hơn 0")
    private Integer seatNumber;

    @NotNull(message = "Loại ghế không được để trống")
    private SeatType seatType;
}
