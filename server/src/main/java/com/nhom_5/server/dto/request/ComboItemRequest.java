package com.nhom_5.server.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin combo bắp nước chọn mua")
public class ComboItemRequest {

    @Schema(description = "ID combo bắp nước", example = "44444444-4444-4444-4444-444444444444")
    private UUID comboId;

    @Schema(description = "Số lượng combo", example = "2")
    private Integer quantity;
}
