package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.NewsRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.NewsResponse;
import com.nhom_5.server.service.NewsService;
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

@Tag(name = "13. Tin tức (News)", description = "Các API xem bài viết tin tức điện ảnh và quản lý bài viết tin tức")
@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách bài viết tin tức",
            description = "Tra cứu và tìm kiếm danh sách bài viết tin tức điện ảnh theo từ khóa."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách tin tức thành công")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsResponse>>> getNews(
            @Parameter(description = "Từ khóa tìm kiếm theo tiêu đề hoặc nội dung bài viết", example = "phim")
            @RequestParam(required = false) String keyword
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tin tức thành công", newsService.getNews(keyword)));
    }

    @Operation(
            summary = "[PUBLIC] Lấy chi tiết bài viết tin tức theo ID",
            description = "Tra cứu nội dung đầy đủ của bài viết tin tức dựa trên UUID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin tin tức thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy bài viết")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> getNewsById(
            @Parameter(description = "ID bài viết tin tức (UUID)", example = "77777777-7777-7777-7777-777777777777")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tin tức thành công", newsService.getNewsById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo bài viết tin tức mới",
            description = "Đăng tải bài viết tin tức mới kèm hình ảnh thumbnail.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo tin tức mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<NewsResponse>> createNews(@Valid @RequestBody NewsRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo tin tức mới thành công", newsService.createNews(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật bài viết tin tức",
            description = "Chỉnh sửa tiêu đề, nội dung hoặc ảnh bìa của bài viết tin tức.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật tin tức thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy tin tức"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> updateNews(
            @Parameter(description = "ID bài viết tin tức cần cập nhật (UUID)", example = "77777777-7777-7777-7777-777777777777")
            @PathVariable UUID id,
            @Valid @RequestBody NewsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tin tức thành công", newsService.updateNews(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Xóa bài viết tin tức",
            description = "Xóa bài viết tin tức khỏi hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa tin tức thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy tin tức"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNews(
            @Parameter(description = "ID bài viết tin tức cần xóa (UUID)", example = "77777777-7777-7777-7777-777777777777")
            @PathVariable UUID id
    ) {
        newsService.deleteNews(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tin tức thành công", null));
    }
}
