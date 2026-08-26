package com.nhom_5.server.dto.response.revenue;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thống kê doanh thu chi tiết theo từng cụm rạp")
public class TheaterRevenueResponse {

    @Schema(description = "ID của rạp")
    private UUID theaterId;

    @Schema(description = "Tên cụm rạp", example = "CinemaNest Landmark 81")
    private String theaterName;

    @Schema(description = "Địa chỉ rạp", example = "Tầng B1, Landmark 81, Bình Thạnh, TP.HCM")
    private String address;

    @Schema(description = "Thành phố / Tỉnh", example = "TP. Hồ Chí Minh")
    private String city;

    @Schema(description = "Tổng số phòng chiếu", example = "6")
    private Integer totalRooms;

    @Schema(description = "Số lượng vé đã bán", example = "850")
    private Long ticketsSold;

    @Schema(description = "Doanh thu từ vé", example = "85000000")
    private BigDecimal ticketRevenue;

    @Schema(description = "Doanh thu từ combo", example = "25000000")
    private BigDecimal comboRevenue;

    @Schema(description = "Tổng doanh thu tại rạp", example = "110000000")
    private BigDecimal totalRevenue;

    @Schema(description = "Tỷ trọng đóng góp trên tổng doanh thu (%)", example = "45.2")
    private Double percentage;
}
