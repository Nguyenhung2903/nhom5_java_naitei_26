package com.nhom_5.server.dto.request;

import com.nhom_5.server.entity.enums.SeatType;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
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
public class BatchSeatTypeRequest {

    @NotEmpty(message = "Danh sách ID ghế không được để trống")
    private List<UUID> seatIds;

    @NotNull(message = "Loại ghế không được để trống")
    private SeatType seatType;
}
