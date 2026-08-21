package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.PromotionRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.PromotionResponse;
import com.nhom_5.server.entity.enums.PromotionStatus;
import com.nhom_5.server.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "Quản lý Khuyến mãi (Promotions)", description = "API tra cứu và quản trị khuyến mãi")
@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @Operation(summary = "Lấy danh sách khuyến mãi", description = "Hỗ trợ tìm kiếm theo tiêu đề, mã và lọc trạng thái.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getPromotions(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) PromotionStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách khuyến mãi thành công",
                promotionService.getPromotions(keyword, status)
        ));
    }

    @Operation(summary = "Lấy chi tiết khuyến mãi")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin khuyến mãi thành công",
                promotionService.getPromotionById(id)
        ));
    }

    @Operation(summary = "Tạo khuyến mãi mới", security = {@SecurityRequirement(name = "bearerAuth")})
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo khuyến mãi mới thành công", promotionService.createPromotion(request)));
    }

    @Operation(summary = "Cập nhật khuyến mãi", security = {@SecurityRequirement(name = "bearerAuth")})
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @PathVariable UUID id,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật khuyến mãi thành công",
                promotionService.updatePromotion(id, request)
        ));
    }

    @Operation(summary = "Xóa khuyến mãi", security = {@SecurityRequirement(name = "bearerAuth")})
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(@PathVariable UUID id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công", null));
    }
}
