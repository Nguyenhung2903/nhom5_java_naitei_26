package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.PromotionRequest;
import com.nhom_5.server.dto.response.PromotionResponse;
import com.nhom_5.server.entity.enums.PromotionStatus;

import java.util.List;
import java.util.UUID;

public interface PromotionService {

    List<PromotionResponse> getPromotions(String keyword, PromotionStatus status);

    PromotionResponse getPromotionById(UUID id);

    PromotionResponse createPromotion(PromotionRequest request);

    PromotionResponse updatePromotion(UUID id, PromotionRequest request);

    void deletePromotion(UUID id);
}
