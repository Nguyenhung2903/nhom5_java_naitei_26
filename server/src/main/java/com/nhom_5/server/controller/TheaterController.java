package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.TheaterRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.TheaterResponse;
import com.nhom_5.server.service.TheaterService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/theaters")
@RequiredArgsConstructor
public class TheaterController {
    private final TheaterService theaterService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TheaterResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách rạp thành công", theaterService.getAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterResponse>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin rạp thành công", theaterService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> create(@Valid @RequestBody TheaterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo rạp thành công", theaterService.create(request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> update(@PathVariable UUID id, @Valid @RequestBody TheaterRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật rạp thành công", theaterService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable UUID id) {
        theaterService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa rạp thành công", null));
    }
}
