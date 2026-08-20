package com.nhom_5.server.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TheaterRequest {
    @NotBlank(message = "Tên rạp không được để trống")
    @Size(max = 255, message = "Tên rạp không được vượt quá 255 ký tự")
    private String name;

    @NotBlank(message = "Địa chỉ rạp không được để trống")
    @Size(max = 1000, message = "Địa chỉ không được vượt quá 1000 ký tự")
    private String address;

    @Size(max = 30, message = "Số điện thoại không được vượt quá 30 ký tự")
    private String phone;

    @DecimalMin(value = "-90.0", message = "Vĩ độ không hợp lệ")
    @DecimalMax(value = "90.0", message = "Vĩ độ không hợp lệ")
    private BigDecimal latitude;

    @DecimalMin(value = "-180.0", message = "Kinh độ không hợp lệ")
    @DecimalMax(value = "180.0", message = "Kinh độ không hợp lệ")
    private BigDecimal longitude;
}
