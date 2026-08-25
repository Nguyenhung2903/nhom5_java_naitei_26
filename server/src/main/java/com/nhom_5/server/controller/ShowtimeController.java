package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.ShowtimeRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.ShowtimeResponse;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.service.ShowtimeService;
import com.nhom_5.server.entity.enums.ShowtimeStatus;
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

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Tag(name = "07. Suất chiếu (Showtimes)", description = "Các API tra cứu lịch chiếu phim và quản lý tạo lịch chiếu")
@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
public class ShowtimeController {

    private final ShowtimeService showtimeService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách suất chiếu",
            description = "Tra cứu toàn bộ suất chiếu hoặc lọc theo bộ 3 điều kiện đồng thời: Phim (movieId), Cụm rạp (theaterId), Ngày chiếu (date)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách suất chiếu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Lỗi khi chỉ truyền 1 hoặc 2 trong bộ 3 tham số lọc")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<ShowtimeResponse>>> getAll(
            @Parameter(description = "ID phim (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @RequestParam(required = false) UUID movieId,
            @Parameter(description = "ID rạp (UUID)", example = "11111111-1111-1111-1111-111111111111")
            @RequestParam(required = false) UUID theaterId,
            @Parameter(description = "Ngày xem (YYYY-MM-DD)", example = "2026-09-01")
                        @RequestParam(required = false) LocalDate date,
                        @RequestParam(required = false) UUID roomId,
                        @RequestParam(required = false) ShowtimeStatus status
    ) {
                List<ShowtimeResponse> showtimes = showtimeService.getAll(movieId, theaterId, roomId, date, status);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách suất chiếu thành công", showtimes));
    }

    @Operation(
            summary = "[PUBLIC] Lấy chi tiết suất chiếu theo ID",
            description = "Tra cứu thông tin chi tiết một suất chiếu (phim, phòng chiếu, thời gian bắt đầu/kết thúc, trạng thái)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin suất chiếu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy suất chiếu")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> getById(
            @Parameter(description = "ID suất chiếu (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin suất chiếu thành công", showtimeService.getById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo suất chiếu mới",
            description = "Thêm một suất chiếu vào phòng chiếu (tự động kiểm tra xung đột khung giờ phòng).",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo suất chiếu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc bị trùng lịch chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> create(@Valid @RequestBody ShowtimeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo suất chiếu thành công", showtimeService.create(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật suất chiếu",
            description = "Cập nhật thời gian hoặc trạng thái của suất chiếu.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật suất chiếu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy suất chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ShowtimeResponse>> update(
            @Parameter(description = "ID suất chiếu cần cập nhật (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID id,
            @Valid @RequestBody ShowtimeRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật suất chiếu thành công", showtimeService.update(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Xóa suất chiếu",
            description = "Hủy / Xóa suất chiếu khỏi hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa suất chiếu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy suất chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID suất chiếu cần xóa (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID id
    ) {
        showtimeService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa suất chiếu thành công", null));
    }
}
