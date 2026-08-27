package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.enums.BookingStatus;
import com.nhom_5.server.entity.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MyBookingResponse {
    private UUID id;
    private String bookingCode;
    private Instant bookingTime;
    private BigDecimal totalAmount;
    private BookingStatus bookingStatus;
    private PaymentStatus paymentStatus;
    private Integer pointsUsed;
    private BigDecimal pointsDiscountAmount;
    private Integer pointsEarned;

    // Movie info
    private String movieTitle;
    private String moviePoster;
    private String ageRating;

    // Theater info
    private String theaterName;
    private String roomName;
    private Instant showtimeStartTime;
    private Instant showtimeEndTime;

    // Tickets & Combos
    private List<String> seatNames;
    private List<String> combos; // e.g. "2x Popcorn", "1x Coke"
}
