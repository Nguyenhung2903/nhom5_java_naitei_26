package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.DiscountType;
import com.nhom_5.server.entity.enums.PromotionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu tạo hoặc cập nhật khuyến mãi")
public class PromotionRequest {

    @NotBlank(message = "Tiêu đề khuyến mãi không được để trống")
    @Size(max = 255, message = "Tiêu đề khuyến mãi không vượt quá 255 ký tự")
    @Schema(description = "Tiêu đề khuyến mãi", example = "Giảm giá cuối tuần")
    private String title;

    @Schema(description = "Mô tả khuyến mãi")
    private String description;

    @NotNull(message = "Loại giảm giá không được để trống")
    @Schema(description = "Loại giảm giá", example = "PERCENT")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm giá không được để trống")
    @DecimalMin(value = "0.01", message = "Giá trị giảm giá phải lớn hơn 0")
    @Schema(description = "Giá trị giảm giá", example = "20")
    private BigDecimal discountValue;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @Schema(description = "Thời gian bắt đầu", example = "2026-08-21T00:00:00Z")
    private Instant startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Schema(description = "Thời gian kết thúc", example = "2026-08-31T23:59:59Z")
    private Instant endDate;

    @NotNull(message = "Trạng thái khuyến mãi không được để trống")
    @Schema(description = "Trạng thái khuyến mãi", example = "ACTIVE")
    private PromotionStatus status;

    @NotBlank(message = "Mã khuyến mãi không được để trống")
    @Size(max = 100, message = "Mã khuyến mãi không vượt quá 100 ký tự")
    @Schema(description = "Mã khuyến mãi", example = "WEEKEND20")
    private String code;
}
