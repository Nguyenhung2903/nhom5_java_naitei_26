package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.PromotionRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.PromotionResponse;
import com.nhom_5.server.entity.enums.PromotionStatus;
import com.nhom_5.server.service.PromotionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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

@Tag(name = "12. Khuyến mãi (Promotions)", description = "Các API tra cứu mã giảm giá, kiểm tra tính hợp lệ và quản trị khuyến mãi")
@RestController
@RequestMapping("/promotions")
@RequiredArgsConstructor
public class PromotionController {

    private final PromotionService promotionService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách chương trình khuyến mãi",
            description = "Hỗ trợ tìm kiếm theo tiêu đề, mã voucher và lọc theo trạng thái khuyến mãi (ACTIVE, INACTIVE, EXPIRED)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách khuyến mãi thành công")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<PromotionResponse>>> getPromotions(
            @Parameter(description = "Từ khóa tìm kiếm theo tiêu đề hoặc mã giảm giá", example = "WEEKEND")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Lọc theo trạng thái khuyến mãi (ACTIVE, INACTIVE, EXPIRED)")
            @RequestParam(required = false) PromotionStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy danh sách khuyến mãi thành công",
                promotionService.getPromotions(keyword, status)
        ));
    }

    @Operation(
            summary = "[PUBLIC] Lấy chi tiết chương trình khuyến mãi theo ID",
            description = "Tra cứu thông tin chi tiết của một voucher khuyến mãi (loại giảm giá, giá trị giảm, hạn sử dụng)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin khuyến mãi thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy khuyến mãi")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> getPromotionById(
            @Parameter(description = "ID khuyến mãi (UUID)", example = "66666666-6666-6666-6666-666666666666")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Lấy thông tin khuyến mãi thành công",
                promotionService.getPromotionById(id)
        ));
    }

        @GetMapping("/validate")
        public ResponseEntity<ApiResponse<PromotionResponse>> validateCode(@RequestParam String code) {
                return ResponseEntity.ok(ApiResponse.success(
                                "Mã giảm giá hợp lệ", promotionService.validateCode(code)));
        }

    @Operation(
            summary = "[ADMIN] Tạo chương trình khuyến mãi mới",
            description = "Thêm mã voucher / khuyến mãi mới vào hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo khuyến mãi mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc mã khuyến mãi đã tồn tại"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<PromotionResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo khuyến mãi mới thành công", promotionService.createPromotion(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật chương trình khuyến mãi",
            description = "Cập nhật giá trị giảm giá, thời hạn sử dụng hoặc trạng thái kích hoạt của voucher.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật khuyến mãi thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy khuyến mãi"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PromotionResponse>> updatePromotion(
            @Parameter(description = "ID khuyến mãi cần cập nhật (UUID)", example = "66666666-6666-6666-6666-666666666666")
            @PathVariable UUID id,
            @Valid @RequestBody PromotionRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                "Cập nhật khuyến mãi thành công",
                promotionService.updatePromotion(id, request)
        ));
    }

    @Operation(
            summary = "[ADMIN] Xóa chương trình khuyến mãi",
            description = "Xóa khuyến mãi khỏi danh mục hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa khuyến mãi thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy khuyến mãi"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePromotion(
            @Parameter(description = "ID khuyến mãi cần xóa (UUID)", example = "66666666-6666-6666-6666-666666666666")
            @PathVariable UUID id
    ) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa khuyến mãi thành công", null));
    }
}
