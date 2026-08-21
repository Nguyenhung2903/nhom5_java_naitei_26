package com.nhom_5.server.dto.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class HoldSeatsRequest {
    @NotEmpty(message = "Danh sách ghế không được để trống")
    private List<UUID> seatIds;
}
