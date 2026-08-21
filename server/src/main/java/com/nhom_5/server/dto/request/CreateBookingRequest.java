package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.PaymentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBookingRequest {
    private UUID showtimeId;
    private List<UUID> seatIds;
    private List<ComboItemRequest> combos;
    private PaymentMethod paymentMethod;
    private String paymentTransactionId;
    private String discountCode;
}
