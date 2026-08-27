package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.GenreRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.service.GenreService;
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

@Tag(name = "03b. Quản lý Thể loại (Genres)", description = "Các API tra cứu, thêm, sửa, xóa danh mục thể loại phim")
@RestController
@RequestMapping("/genres")
@RequiredArgsConstructor
public class GenreController {

    private final GenreService genreService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách thể loại phim",
            description = "Tra cứu toàn bộ thể loại phim có trong hệ thống hoặc tìm kiếm theo từ khóa tên/mô tả."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách thể loại thành công")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getGenres(
            @Parameter(description = "Từ khóa tìm kiếm theo tên hoặc mô tả thể loại", example = "Hành động")
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thể loại thành công", genreService.getGenres(keyword)));
    }

    @Operation(
            summary = "[PUBLIC] Lấy chi tiết thể loại phim theo ID",
            description = "Tra cứu thông tin chi tiết một thể loại phim dựa trên UUID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin thể loại thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy thể loại phim")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> getGenreById(
            @Parameter(description = "ID của thể loại phim (UUID)", example = "cc1fdf16-e524-4c87-a027-74de957a0359")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin thể loại thành công", genreService.getGenreById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo thể loại phim mới",
            description = "Thêm một thể loại phim mới vào danh mục hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo thể loại mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc tên thể loại đã tồn tại"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<GenreResponse>> createGenre(@Valid @RequestBody GenreRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo thể loại mới thành công", genreService.createGenre(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật thông tin thể loại phim",
            description = "Cập nhật tên hoặc mô tả của thể loại phim đã có. Cho phép cập nhật cả khi thể loại đang được gán cho phim.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật thể loại thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc tên thể loại bị trùng lặp"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy thể loại phim"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GenreResponse>> updateGenre(
            @Parameter(description = "ID của thể loại phim cần cập nhật (UUID)", example = "cc1fdf16-e524-4c87-a027-74de957a0359")
            @PathVariable UUID id,
            @Valid @RequestBody GenreRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thể loại thành công", genreService.updateGenre(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Xóa thể loại phim",
            description = "Xóa một thể loại phim khỏi hệ thống. Thao tác sẽ bị từ chối nếu thể loại đang được liên kết với ít nhất một bộ phim.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa thể loại thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Thể loại đang được gán cho phim, không thể xóa"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy thể loại phim"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGenre(
            @Parameter(description = "ID của thể loại phim cần xóa (UUID)", example = "cc1fdf16-e524-4c87-a027-74de957a0359")
            @PathVariable UUID id
    ) {
        genreService.deleteGenre(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thể loại thành công", null));
    }
}
