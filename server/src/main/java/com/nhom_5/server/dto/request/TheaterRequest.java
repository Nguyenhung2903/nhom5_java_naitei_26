package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "Dữ liệu tạo hoặc cập nhật cụm rạp")
public class TheaterRequest {

    @NotBlank(message = "Tên rạp không được để trống")
    @Size(max = 255, message = "Tên rạp không được vượt quá 255 ký tự")
    @Schema(description = "Tên cụm rạp", example = "CinemaNest Landmark 81")
    private String name;

    @NotBlank(message = "Địa chỉ rạp không được để trống")
    @Size(max = 1000, message = "Địa chỉ không được vượt quá 1000 ký tự")
    @Schema(description = "Địa chỉ chi tiết", example = "Tầng B1, Vincom Center Landmark 81, 720A Điện Biên Phủ, P. 22, Q. Bình Thạnh, TP. HCM")
    private String address;

    @Size(max = 30, message = "Số điện thoại không được vượt quá 30 ký tự")
    @Schema(description = "Số điện thoại liên hệ rạp", example = "19001234")
    private String phone;

    @DecimalMin(value = "-90.0", message = "Vĩ độ không hợp lệ")
    @DecimalMax(value = "90.0", message = "Vĩ độ không hợp lệ")
    @Schema(description = "Tọa độ vĩ độ (Latitude)", example = "10.7949")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Kinh độ không hợp lệ")
    @DecimalMax(value = "180.0", message = "Kinh độ không hợp lệ")
    @Schema(description = "Tọa độ kinh độ (Longitude)", example = "106.7218")
    private BigDecimal longitude;
}
