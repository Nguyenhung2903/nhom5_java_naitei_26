package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.PaymentMethod;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu yêu cầu tạo đơn đặt vé xem phim")
public class CreateBookingRequest {

    @Schema(description = "ID suất chiếu", example = "33333333-3333-3333-3333-333333333333")
    private UUID showtimeId;

    @Schema(description = "Danh sách ID ghế đã chọn", example = "[\"55555555-5555-5555-5555-555555555551\"]")
    private List<UUID> seatIds;

    @Schema(description = "Danh sách combo bắp nước chọn thêm")
    private List<ComboItemRequest> combos;

    @Schema(description = "Phương thức thanh toán: CASH (Tiền mặt tại quầy), VNPAY (Thanh toán online)", example = "VNPAY")
    private PaymentMethod paymentMethod;

    @Schema(description = "Mã giao dịch từ cổng thanh toán (nếu đã thanh toán online thành công)", example = "VNP14589234")
    private String paymentTransactionId;

    @Schema(description = "Mã khuyến mãi giảm giá (nếu có)", example = "WEEKEND20")
    private String discountCode;

    @Schema(description = "Các tham số phản hồi từ VNPay (khi xử lý callback đơn hàng)")
    private Map<String, String> vnpayParams;
}
