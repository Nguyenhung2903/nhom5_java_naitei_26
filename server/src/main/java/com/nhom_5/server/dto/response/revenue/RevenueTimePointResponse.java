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
@Schema(description = "Điểm dữ liệu doanh thu theo mốc thời gian (ngày hoặc tháng)")
public class RevenueTimePointResponse {

    @Schema(description = "Nhãn thời gian (VD: 2026-08-26 hoặc 08/2026)", example = "2026-08-26")
    private String dateLabel;

    @Schema(description = "Tổng doanh thu trong mốc thời gian", example = "15000000")
    private BigDecimal totalRevenue;

    @Schema(description = "Doanh thu vé trong mốc thời gian", example = "12000000")
    private BigDecimal ticketRevenue;

    @Schema(description = "Doanh thu combo trong mốc thời gian", example = "3000000")
    private BigDecimal comboRevenue;

    @Schema(description = "Số lượng vé bán ra trong mốc thời gian", example = "120")
    private Long ticketCount;

    @Schema(description = "Số lượng đơn đặt vé", example = "50")
    private Long bookingCount;
}
