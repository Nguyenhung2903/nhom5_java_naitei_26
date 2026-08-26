package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Theater;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TheaterResponse {
    private UUID id;
    private String name;
    private String address;
    private String phone;

    public static TheaterResponse fromEntity(Theater theater) {
        return TheaterResponse.builder()
                .id(theater.getId())
                .name(theater.getName())
                .address(theater.getAddress())
                .phone(theater.getPhone())
                .build();
    }
}
