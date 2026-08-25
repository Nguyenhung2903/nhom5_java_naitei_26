package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.PromotionRequest;
import com.nhom_5.server.dto.response.PromotionResponse;
import com.nhom_5.server.entity.Promotion;
import com.nhom_5.server.entity.enums.DiscountType;
import com.nhom_5.server.entity.enums.PromotionStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.PromotionRepository;
import com.nhom_5.server.service.PromotionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionServiceImpl implements PromotionService {

    private static final BigDecimal MAX_PERCENT_DISCOUNT = BigDecimal.valueOf(100);

    private final PromotionRepository promotionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PromotionResponse> getPromotions(String keyword, PromotionStatus status) {
        String normalizedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        List<Promotion> promotions;
        if (normalizedKeyword != null && status != null) {
            promotions = promotionRepository.searchByKeywordAndStatus(normalizedKeyword, status);
        } else if (normalizedKeyword != null) {
            promotions = promotionRepository.searchByKeyword(normalizedKeyword);
        } else if (status != null) {
            promotions = promotionRepository.findByStatusOrderByStartDateDescCreatedAtDesc(status);
        } else {
            promotions = promotionRepository.findAllByOrderByStartDateDescCreatedAtDesc();
        }

        return promotions.stream()
                .map(PromotionResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse getPromotionById(UUID id) {
        return PromotionResponse.fromEntity(findPromotion(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PromotionResponse validateCode(String code) {
        return PromotionResponse.fromEntity(findValidPromotion(code));
    }

    @Override
    @Transactional
    public PromotionResponse createPromotion(PromotionRequest request) {
        validateRequest(request, null);
        Promotion promotion = Promotion.builder().build();
        applyRequest(promotion, request);
        return PromotionResponse.fromEntity(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public PromotionResponse updatePromotion(UUID id, PromotionRequest request) {
        Promotion promotion = findPromotion(id);
        validateRequest(request, id);
        applyRequest(promotion, request);
        return PromotionResponse.fromEntity(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public void deletePromotion(UUID id) {
        Promotion promotion = findPromotion(id);
        promotionRepository.delete(promotion);
    }

    private Promotion findPromotion(UUID id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy khuyến mãi với ID: " + id));
    }

    private Promotion findValidPromotion(String code) {
        String normalizedCode = StringUtils.hasText(code) ? code.trim() : "";
        Promotion promotion = promotionRepository.findByCodeIgnoreCase(normalizedCode)
                .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Mã giảm giá không hợp lệ hoặc đã hết hạn"));
        Instant now = Instant.now();
        if (promotion.getStatus() != PromotionStatus.ACTIVE
                || now.isBefore(promotion.getStartDate())
                || !now.isBefore(promotion.getEndDate())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã giảm giá không hợp lệ hoặc đã hết hạn");
        }
        return promotion;
    }

    private void validateRequest(PromotionRequest request, UUID currentId) {
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Ngày kết thúc khuyến mãi phải sau ngày bắt đầu");
        }

        if (request.getDiscountType() == DiscountType.PERCENT
                && request.getDiscountValue().compareTo(MAX_PERCENT_DISCOUNT) > 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Giá trị giảm theo phần trăm không được vượt quá 100");
        }

        String normalizedCode = request.getCode().trim();
        boolean codeExists = currentId == null
                ? promotionRepository.existsByCodeIgnoreCase(normalizedCode)
                : promotionRepository.existsByCodeIgnoreCaseAndIdNot(normalizedCode, currentId);
        if (codeExists) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Mã khuyến mãi đã tồn tại trong hệ thống");
        }
    }

    private void applyRequest(Promotion promotion, PromotionRequest request) {
        promotion.setTitle(request.getTitle().trim());
        promotion.setDescription(trimToNull(request.getDescription()));
        promotion.setDiscountType(request.getDiscountType());
        promotion.setDiscountValue(request.getDiscountValue());
        promotion.setStartDate(request.getStartDate());
        promotion.setEndDate(request.getEndDate());
        promotion.setStatus(request.getStatus());
        promotion.setCode(request.getCode().trim().toUpperCase());
    }

    private String trimToNull(String value) {
        return StringUtils.hasText(value) ? value.trim() : null;
    }
}
