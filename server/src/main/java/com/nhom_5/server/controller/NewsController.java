package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.NewsRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.NewsResponse;
import com.nhom_5.server.service.NewsService;
import io.swagger.v3.oas.annotations.Operation;
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

@Tag(name = "news-controller", description = "API tra cứu và quản trị tin tức")
@RestController
@RequestMapping("/news")
@RequiredArgsConstructor
public class NewsController {

    private final NewsService newsService;

    @Operation(summary = "Lấy danh sách tin tức", description = "Hỗ trợ tìm kiếm theo tiêu đề hoặc nội dung.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<NewsResponse>>> getNews(@RequestParam(required = false) String keyword) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách tin tức thành công", newsService.getNews(keyword)));
    }

    @Operation(summary = "Lấy chi tiết tin tức")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> getNewsById(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tin tức thành công", newsService.getNewsById(id)));
    }

    @Operation(summary = "Tạo tin tức mới", security = {@SecurityRequirement(name = "bearerAuth")})
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<NewsResponse>> createNews(@Valid @RequestBody NewsRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo tin tức mới thành công", newsService.createNews(request)));
    }

    @Operation(summary = "Cập nhật tin tức", security = {@SecurityRequirement(name = "bearerAuth")})
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NewsResponse>> updateNews(
            @PathVariable UUID id,
            @Valid @RequestBody NewsRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật tin tức thành công", newsService.updateNews(id, request)));
    }

    @Operation(summary = "Xóa tin tức", security = {@SecurityRequirement(name = "bearerAuth")})
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNews(@PathVariable UUID id) {
        newsService.deleteNews(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa tin tức thành công", null));
    }
}
