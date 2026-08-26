package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.SeatType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu tạo nhanh nguyên một hàng ghế mới trong phòng chiếu")
public class CreateRowSeatRequest {

    @NotNull(message = "ID phòng không được để trống")
    @Schema(description = "ID phòng chiếu chứa ghế", example = "22222222-2222-2222-2222-222222222222")
    private UUID roomId;

    @NotBlank(message = "Ký hiệu hàng ghế không được để trống")
    @Size(max = 2, message = "Ký hiệu hàng ghế tối đa 2 ký tự (VD: A, B, AA)")
    @Pattern(regexp = "^[a-zA-Z]+$", message = "Ký hiệu hàng ghế chỉ được chứa chữ cái A-Z")
    @Schema(description = "Ký hiệu hàng ghế (A, B, C, ...)", example = "F")
    private String seatRow;

    @NotNull(message = "Số lượng ghế không được để trống")
    @Min(value = 1, message = "Số lượng ghế phải từ 1 trở lên")
    @Max(value = 50, message = "Số lượng ghế mỗi hàng tối đa là 50")
    @Schema(description = "Số lượng ghế cần tạo trong hàng (VD: 10 ghế -> F1 đến F10)", example = "10")
    private Integer seatCount;

    @NotNull(message = "Loại ghế không được để trống")
    @Schema(description = "Loại ghế mặc định cho cả hàng: NORMAL (Thường), VIP (VIP), COUPLE (Đôi)", example = "NORMAL")
    private SeatType seatType;
}
