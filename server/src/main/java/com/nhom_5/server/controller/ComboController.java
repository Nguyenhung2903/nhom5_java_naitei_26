package com.nhom_5.server.controller;

import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.service.ComboService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/combos")
@RequiredArgsConstructor
public class ComboController {
    private final ComboService comboService;

    @GetMapping("/active")
    public ApiResponse<List<ComboResponse>> getActiveCombos() {
        return ApiResponse.success(comboService.getActiveCombos());
    }
}
