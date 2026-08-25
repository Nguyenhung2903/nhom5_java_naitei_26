package com.nhom_5.server.service;

import com.nhom_5.server.dto.response.PromotionResponse;
import com.nhom_5.server.entity.Promotion;
import com.nhom_5.server.entity.enums.DiscountType;
import com.nhom_5.server.entity.enums.PromotionStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.PromotionRepository;
import com.nhom_5.server.service.impl.PromotionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {
    @Mock
    private PromotionRepository promotionRepository;

    @InjectMocks
    private PromotionServiceImpl promotionService;

    @Test
    void validateCodeAcceptsTrimmedCaseInsensitiveCodeWithinActiveWindow() {
        Promotion promotion = promotion(PromotionStatus.ACTIVE, Instant.now().minus(1, ChronoUnit.HOURS), Instant.now().plus(1, ChronoUnit.HOURS));
        when(promotionRepository.findByCodeIgnoreCase("save10")).thenReturn(Optional.of(promotion));

        PromotionResponse response = promotionService.validateCode("  save10  ");

        assertEquals(promotion.getId(), response.getId());
    }

    @Test
    void validateCodeRejectsExpiredPromotion() {
        when(promotionRepository.findByCodeIgnoreCase(anyString()))
                .thenReturn(Optional.of(promotion(PromotionStatus.ACTIVE, Instant.now().minus(2, ChronoUnit.HOURS), Instant.now().minus(1, ChronoUnit.HOURS))));

        AppException exception = assertThrows(AppException.class, () -> promotionService.validateCode("SAVE10"));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void validateCodeRejectsFuturePromotion() {
        when(promotionRepository.findByCodeIgnoreCase(anyString()))
                .thenReturn(Optional.of(promotion(PromotionStatus.ACTIVE, Instant.now().plus(1, ChronoUnit.HOURS), Instant.now().plus(2, ChronoUnit.HOURS))));

        AppException exception = assertThrows(AppException.class, () -> promotionService.validateCode("SAVE10"));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void validateCodeRejectsInactivePromotion() {
        when(promotionRepository.findByCodeIgnoreCase(anyString()))
                .thenReturn(Optional.of(promotion(PromotionStatus.INACTIVE, Instant.now().minus(1, ChronoUnit.HOURS), Instant.now().plus(1, ChronoUnit.HOURS))));

        AppException exception = assertThrows(AppException.class, () -> promotionService.validateCode("SAVE10"));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    private Promotion promotion(PromotionStatus status, Instant start, Instant end) {
        return Promotion.builder()
                .id(java.util.UUID.randomUUID())
                .title("Save 10")
                .discountType(DiscountType.PERCENT)
                .discountValue(BigDecimal.TEN)
                .startDate(start)
                .endDate(end)
                .status(status)
                .code("SAVE10")
                .build();
    }
}
