package com.nhom_5.server.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;

public record ShowtimeSeatResponse(
        UUID id,
        String seatRow,
        Integer seatNumber,
        String seatType,
        BigDecimal price,
        ShowtimeSeatStatus status,
        Instant heldUntil) {
}
