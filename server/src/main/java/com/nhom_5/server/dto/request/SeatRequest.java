package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.SeatType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
@Schema(description = "Dữ liệu tạo hoặc cập nhật ghế ngồi trong phòng chiếu")
public class SeatRequest {

    @NotNull(message = "ID phòng không được để trống")
    @Schema(description = "ID phòng chiếu chứa ghế", example = "22222222-2222-2222-2222-222222222222")
    private UUID roomId;

    @NotBlank(message = "Hàng ghế không được để trống")
    @Size(max = 10, message = "Hàng ghế không được vượt quá 10 ký tự")
    @Schema(description = "Ký hiệu hàng ghế (A, B, C, ...)", example = "A")
    private String seatRow;

    @NotNull(message = "Số ghế không được để trống")
    @Positive(message = "Số ghế phải lớn hơn 0")
    @Schema(description = "Số thứ tự ghế trong hàng (1, 2, 3, ...)", example = "1")
    private Integer seatNumber;

    @NotNull(message = "Loại ghế không được để trống")
    @Schema(description = "Loại ghế: STANDARD (Thường), VIP (VIP), SWEETBOX (Đôi)", example = "STANDARD")
    private SeatType seatType;
}
