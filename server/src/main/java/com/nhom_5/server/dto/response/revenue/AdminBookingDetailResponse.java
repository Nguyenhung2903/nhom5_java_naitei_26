package com.nhom_5.server.dto.response.revenue;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin chi tiết đơn đặt vé phục vụ quản trị và đối soát doanh thu")
public class AdminBookingDetailResponse {

    @Schema(description = "ID đơn đặt vé")
    private UUID bookingId;

    @Schema(description = "Mã đơn đặt vé", example = "BK-1718293")
    private String bookingCode;

    @Schema(description = "Thời gian đặt vé")
    private Instant bookingTime;

    @Schema(description = "ID khách hàng")
    private UUID customerId;

    @Schema(description = "Tên khách hàng", example = "Nguyễn Văn A")
    private String customerName;

    @Schema(description = "Email khách hàng", example = "customer@example.com")
    private String customerEmail;

    @Schema(description = "Số điện thoại khách hàng", example = "0912345678")
    private String customerPhone;

    @Schema(description = "Tên bộ phim", example = "Avengers: Secret Wars")
    private String movieTitle;

    @Schema(description = "Ảnh áp phích phim")
    private String moviePosterUrl;

    @Schema(description = "Tên cụm rạp", example = "CinemaNest Landmark 81")
    private String theaterName;

    @Schema(description = "Tên phòng chiếu", example = "Phòng VIP 01")
    private String roomName;

    @Schema(description = "Thời gian suất chiếu")
    private Instant showtimeStartTime;

    @Schema(description = "Danh sách ghế ngồi", example = "[\"A01\", \"A02\"]")
    private List<String> seats;

    @Schema(description = "Số lượng vé", example = "2")
    private Integer ticketCount;

    @Schema(description = "Danh sách combo bắp nước đi kèm")
    private List<AdminBookingComboItem> combos;

    @Schema(description = "Mã giảm giá áp dụng (nếu có)", example = "SUMMER2026")
    private String promotionCode;

    @Schema(description = "Tổng số tiền thanh toán (VNĐ)", example = "250000")
    private BigDecimal totalAmount;

    @Schema(description = "Phương thức thanh toán", example = "VNPAY")
    private String paymentMethod;

    @Schema(description = "Trạng thái thanh toán", example = "PAID")
    private String paymentStatus;

    @Schema(description = "Trạng thái đơn vé", example = "CONFIRMED")
    private String bookingStatus;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminBookingComboItem {
        private String comboName;
        private Integer quantity;
        private BigDecimal price;
    }
}
