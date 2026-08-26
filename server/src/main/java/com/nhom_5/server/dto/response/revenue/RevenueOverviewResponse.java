package com.nhom_5.server.dto.response.revenue;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Thông tin tổng quan các chỉ số doanh thu (KPIs)")
public class RevenueOverviewResponse {

    @Schema(description = "Tổng doanh thu thực tế (Vé + Combo)", example = "150000000")
    private BigDecimal totalRevenue;

    @Schema(description = "Doanh thu từ tiền bán vé", example = "120000000")
    private BigDecimal ticketRevenue;

    @Schema(description = "Doanh thu từ bắp nước & Combo", example = "30000000")
    private BigDecimal comboRevenue;

    @Schema(description = "Tổng số vé đã bán ra", example = "1500")
    private Long totalTicketsSold;

    @Schema(description = "Tổng số đơn đặt vé thành công", example = "650")
    private Long totalBookings;

    @Schema(description = "Giá trị trung bình trên mỗi đơn hàng (AOV)", example = "230769")
    private BigDecimal averageOrderValue;

    @Schema(description = "Tỷ lệ tăng trưởng so với kỳ trước (%)", example = "12.5")
    private Double growthRate;
}
