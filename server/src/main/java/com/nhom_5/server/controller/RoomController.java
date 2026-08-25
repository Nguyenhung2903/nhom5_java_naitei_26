package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.RoomRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.RoomResponse;
import com.nhom_5.server.service.RoomService;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "05. Phòng chiếu (Rooms)", description = "Các API quản lý danh sách phòng chiếu thuộc từng cụm rạp")
@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @Operation(
            summary = "[ADMIN] Lấy danh sách toàn bộ phòng chiếu",
            description = "Tra cứu danh sách các phòng chiếu trong hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<RoomResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng thành công", roomService.getAll()));
    }

    @Operation(
            summary = "[ADMIN] Lấy chi tiết phòng chiếu theo ID",
            description = "Tra cứu thông tin chi tiết một phòng chiếu và rạp tương ứng.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> getById(
            @Parameter(description = "ID của phòng chiếu (UUID)", example = "22222222-2222-2222-2222-222222222222")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phòng thành công", roomService.getById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo phòng chiếu mới",
            description = "Thêm một phòng chiếu mới gắn liền với một cụm rạp.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc theaterId không tồn tại"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> create(@Valid @RequestBody RoomRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo phòng thành công", roomService.create(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật thông tin phòng chiếu",
            description = "Cập nhật tên phòng hoặc cụm rạp sở hữu phòng chiếu.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<RoomResponse>> update(
            @Parameter(description = "ID phòng chiếu cần cập nhật (UUID)", example = "22222222-2222-2222-2222-222222222222")
            @PathVariable UUID id,
            @Valid @RequestBody RoomRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng thành công", roomService.update(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Khôi phục sơ đồ 50 ghế chuẩn cho phòng",
            description = "Xóa toàn bộ ghế cũ và sinh lại 50 ghế chuẩn theo ma trận (A-B: NORMAL, C-D: VIP, E: COUPLE).",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Khôi phục sơ đồ ghế chuẩn thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Không thể khôi phục ghế khi phòng đã có suất chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PostMapping("/{id}/reset-seats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> resetSeats(
            @Parameter(description = "ID phòng chiếu cần khôi phục ghế (UUID)", example = "22222222-2222-2222-2222-222222222222")
            @PathVariable UUID id
    ) {
        roomService.resetSeats(id);
        return ResponseEntity.ok(ApiResponse.success("Khôi phục sơ đồ ghế chuẩn 50 ghế thành công", null));
    }

    @Operation(
            summary = "[ADMIN] Xóa phòng chiếu",
            description = "Xóa phòng chiếu khỏi hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng chiếu"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(
            @Parameter(description = "ID phòng chiếu cần xóa (UUID)", example = "22222222-2222-2222-2222-222222222222")
            @PathVariable UUID id
    ) {
        roomService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng thành công", null));
    }
}

