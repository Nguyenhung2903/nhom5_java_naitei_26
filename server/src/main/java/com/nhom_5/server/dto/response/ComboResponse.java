package com.nhom_5.server.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ComboResponse {
    private UUID id;
    private String name;
    private String description;
    private BigDecimal price;
    private String image;
}
