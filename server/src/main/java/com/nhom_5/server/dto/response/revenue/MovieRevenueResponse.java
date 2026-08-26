package com.nhom_5.server.dto.response.revenue;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thống kê doanh thu chi tiết theo từng bộ phim")
public class MovieRevenueResponse {

    @Schema(description = "ID của phim")
    private UUID movieId;

    @Schema(description = "Tên phim", example = "Avengers: Secret Wars")
    private String title;

    @Schema(description = "Đường dẫn ảnh áp phích phim")
    private String posterUrl;

    @Schema(description = "Thể loại phim", example = "Hành Động, Viễn Tưởng")
    private String genre;

    @Schema(description = "Ngày công chiếu")
    private LocalDate releaseDate;

    @Schema(description = "Số lượng vé đã bán", example = "450")
    private Long ticketsSold;

    @Schema(description = "Doanh thu từ vé", example = "45000000")
    private BigDecimal ticketRevenue;

    @Schema(description = "Doanh thu từ combo đi kèm vé phim này", example = "12000000")
    private BigDecimal comboRevenue;

    @Schema(description = "Tổng doanh thu của phim", example = "57000000")
    private BigDecimal totalRevenue;

    @Schema(description = "Tỷ trọng đóng góp trên tổng doanh thu (%)", example = "38.5")
    private Double percentage;
}
