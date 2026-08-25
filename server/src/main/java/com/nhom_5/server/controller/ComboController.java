package com.nhom_5.server.controller;

import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.service.ComboService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

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
}
