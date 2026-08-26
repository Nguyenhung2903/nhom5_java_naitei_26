package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.TheaterRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.TheaterResponse;
import com.nhom_5.server.service.TheaterService;
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

@Tag(name = "04. Cụm rạp (Theaters)", description = "Các API tra cứu cụm rạp theo khu vực và quản lý thông tin rạp")
@RestController
@RequestMapping("/theaters")
@RequiredArgsConstructor
public class TheaterController {

    private final TheaterService theaterService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách cụm rạp",
            description = "Lấy tất cả cụm rạp hoặc lọc danh sách rạp đang có suất chiếu của một phim cụ thể (truyền movieId)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách rạp thành công")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<TheaterResponse>>> getAll(
            @Parameter(description = "ID phim để lọc các rạp đang có lịch chiếu (tùy chọn)", example = "33333333-3333-3333-3333-333333333333")
            @RequestParam(required = false) UUID movieId
    ) {
        List<TheaterResponse> theaters = movieId == null
                ? theaterService.getAll()
                : theaterService.getByMovieId(movieId);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách rạp thành công", theaters));
    }

    @Operation(
            summary = "[PUBLIC] Lấy chi tiết rạp theo ID",
            description = "Tra cứu thông tin chi tiết của một cụm rạp (tên, địa chỉ, số điện thoại)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin rạp thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy rạp")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TheaterResponse>> getById(
            @Parameter(description = "ID của rạp (UUID)", example = "11111111-1111-1111-1111-111111111111")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin rạp thành công", theaterService.getById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo cụm rạp mới",
            description = "Thêm một cụm rạp mới vào hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo rạp thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> create(@Valid @RequestBody TheaterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo rạp thành công", theaterService.create(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật thông tin cụm rạp",
            description = "Cập nhật tên, địa chỉ hoặc số điện thoại của rạp.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật rạp thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy rạp"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<TheaterResponse>> update(
            @Parameter(description = "ID của rạp cần cập nhật (UUID)", example = "11111111-1111-1111-1111-111111111111")
            @PathVariable UUID id,
            @Valid @RequestBody TheaterRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật rạp thành công", theaterService.update(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Xóa cụm rạp",
            description = "Xóa rạp khỏi hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa rạp thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy rạp"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID của rạp cần xóa (UUID)", example = "11111111-1111-1111-1111-111111111111")
            @PathVariable UUID id
    ) {
        theaterService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa rạp thành công", null));
    }
}
