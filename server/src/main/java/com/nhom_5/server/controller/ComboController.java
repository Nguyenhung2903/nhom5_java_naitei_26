package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.ComboRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.service.ComboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@Tag(name = "09. Đồ ăn & Combo (Combos)", description = "Các API tra cứu và quản lý danh mục bắp nước, combo ưu đãi")
@RestController
@RequestMapping("/combos")
@RequiredArgsConstructor
public class ComboController {

    private final ComboService comboService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách combo bắp nước đang kích hoạt",
            description = "Tra cứu các gói combo bắp rang, nước ngọt đang được bán kèm khi đặt vé."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách combo thành công")
    })
    @GetMapping("/active")
    public ApiResponse<List<ComboResponse>> getActiveCombos() {
        return ApiResponse.success("Lấy danh sách combo thành công", comboService.getActiveCombos());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<List<ComboResponse>> getAllCombos() {
        return ApiResponse.success("Lấy danh sách combo thành công", comboService.getAllCombos());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComboResponse> createCombo(@Valid @RequestBody ComboRequest request) {
        return ApiResponse.success(201, "Tạo combo thành công", comboService.createCombo(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<ComboResponse> updateCombo(@PathVariable UUID id, @Valid @RequestBody ComboRequest request) {
        return ApiResponse.success("Cập nhật combo thành công", comboService.updateCombo(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> deleteCombo(@PathVariable UUID id) {
        comboService.deleteCombo(id);
        return ApiResponse.success("Xóa combo thành công", null);
    }
}
