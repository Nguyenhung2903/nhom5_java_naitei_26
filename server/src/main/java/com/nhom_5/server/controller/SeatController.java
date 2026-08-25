package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.SeatRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.SeatResponse;
import com.nhom_5.server.service.SeatService;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


import java.util.List;
import java.util.UUID;

@Tag(name = "06. Ghế ngồi (Seats)", description = "Các API quản lý cấu hình sơ đồ ghế theo phòng chiếu (Standard, VIP, Sweetbox)")
@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {

    private final SeatService seatService;

    @Operation(
            summary = "[ADMIN] Lấy danh sách toàn bộ ghế",
            description = "Tra cứu danh sách tất cả các ghế ngồi trong hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ghế thành công", seatService.getAll()));
    }

    @Operation(
            summary = "[ADMIN] Lấy danh sách ghế theo phòng chiếu",
            description = "Tra cứu danh sách tất cả các ghế ngồi thuộc một phòng chiếu cụ thể theo thứ tự hàng và cột.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách ghế theo phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @GetMapping("/room/{roomId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SeatResponse>>> getByRoomId(
            @Parameter(description = "ID của phòng chiếu (UUID)", example = "22222222-2222-2222-2222-222222222222")
            @PathVariable UUID roomId
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách ghế theo phòng thành công", seatService.getByRoomId(roomId)));
    }


    @Operation(
            summary = "[ADMIN] Lấy chi tiết ghế theo ID",
            description = "Tra cứu thông tin một ghế (hàng ghế, số thứ tự, loại ghế, phòng chiếu tương ứng).",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy ghế"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeatResponse>> getById(
            @Parameter(description = "ID của ghế (UUID)", example = "55555555-5555-5555-5555-555555555551")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin ghế thành công", seatService.getById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo ghế ngồi mới",
            description = "Thêm một ghế mới vào phòng chiếu chỉ định.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc trùng vị trí ghế trong phòng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeatResponse>> create(@Valid @RequestBody SeatRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo ghế thành công", seatService.create(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật thông tin ghế",
            description = "Cập nhật hàng ghế, số thứ tự hoặc loại ghế (STANDARD, VIP, SWEETBOX).",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy ghế"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SeatResponse>> update(
            @Parameter(description = "ID ghế cần cập nhật (UUID)", example = "55555555-5555-5555-5555-555555555551")
            @PathVariable UUID id,
            @Valid @RequestBody SeatRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật ghế thành công", seatService.update(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật loại ghế hàng loạt",
            description = "Cập nhật loại ghế (NORMAL, VIP, COUPLE) cho danh sách ghế được chọn.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật loại ghế hàng loạt thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PatchMapping("/batch-type")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> updateBatchType(
            @Valid @RequestBody com.nhom_5.server.dto.request.BatchSeatTypeRequest request
    ) {
        seatService.updateBatchType(request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật loại ghế hàng loạt thành công", null));
    }

    @Operation(
            summary = "[ADMIN] Xóa ghế",
            description = "Xóa ghế khỏi sơ đồ phòng chiếu.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy ghế"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID ghế cần xóa (UUID)", example = "55555555-5555-5555-5555-555555555551")
            @PathVariable UUID id
    ) {
        seatService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa ghế thành công", null));
    }
}

