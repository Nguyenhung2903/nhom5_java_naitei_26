package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Theater;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class TheaterResponse {
    private UUID id;
    private String name;
    private String address;
    private String phone;
    private BigDecimal latitude;
    private BigDecimal longitude;

    public static TheaterResponse fromEntity(Theater theater) {
        return TheaterResponse.builder()
                .id(theater.getId())
                .name(theater.getName())
                .address(theater.getAddress())
                .phone(theater.getPhone())
                .latitude(theater.getLatitude())
                .longitude(theater.getLongitude())
                .build();
    }
}
