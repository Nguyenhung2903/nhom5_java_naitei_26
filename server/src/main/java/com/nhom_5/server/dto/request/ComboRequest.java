package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.ComboStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu tạo hoặc cập nhật combo")
public class ComboRequest {
    @NotBlank(message = "Tên combo không được để trống")
    private String name;

    private String description;

    @NotNull(message = "Giá combo không được để trống")
    @DecimalMin(value = "0.01", message = "Giá combo phải lớn hơn 0")
    private BigDecimal price;

    private String image;

    @NotNull(message = "Trạng thái combo không được để trống")
    private ComboStatus status;
}
