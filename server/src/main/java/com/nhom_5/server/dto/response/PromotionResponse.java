package com.nhom_5.server.dto.response;

import com.nhom_5.server.entity.Promotion;
import com.nhom_5.server.entity.enums.DiscountType;
import com.nhom_5.server.entity.enums.PromotionStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Thông tin khuyến mãi")
public class PromotionResponse {

    private UUID id;
    private String title;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private Instant startDate;
    private Instant endDate;
    private PromotionStatus status;
    private String code;
    private Instant createdAt;
    private Instant updatedAt;

    public static PromotionResponse fromEntity(Promotion promotion) {
        if (promotion == null) {
            return null;
        }
        return PromotionResponse.builder()
                .id(promotion.getId())
                .title(promotion.getTitle())
                .description(promotion.getDescription())
                .discountType(promotion.getDiscountType())
                .discountValue(promotion.getDiscountValue())
                .startDate(promotion.getStartDate())
                .endDate(promotion.getEndDate())
                .status(promotion.getStatus())
                .code(promotion.getCode())
                .createdAt(promotion.getCreatedAt())
                .updatedAt(promotion.getUpdatedAt())
                .build();
    }
}
