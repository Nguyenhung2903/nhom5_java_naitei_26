package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.MovieRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.GenreResponse;
import com.nhom_5.server.dto.response.MovieResponse;
import com.nhom_5.server.entity.enums.MovieStatus;
import com.nhom_5.server.service.MovieService;
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

@Tag(name = "03. Phim & Thể loại (Movies)", description = "Các API tra cứu phim, lọc phim đang chiếu/sắp chiếu và quản trị danh mục phim")
@RestController
@RequestMapping("/movies")
@RequiredArgsConstructor
public class MovieController {

    private final MovieService movieService;

    @Operation(
            summary = "[PUBLIC] Lấy danh sách phim",
            description = "Tra cứu và lọc danh sách phim theo từ khóa tiêu đề hoặc trạng thái (NOW_SHOWING, COMING_SOON, ENDED)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách phim thành công")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<MovieResponse>>> getMovies(
            @Parameter(description = "Từ khóa tìm kiếm theo tên phim hoặc đạo diễn", example = "Avengers")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Trạng thái phim: NOW_SHOWING (Đang chiếu), COMING_SOON (Sắp chiếu), ENDED (Ngừng chiếu)")
            @RequestParam(required = false) MovieStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phim thành công", movieService.getMovies(keyword, status)));
    }

    @Operation(
            summary = "[PUBLIC] Lấy danh sách tất cả thể loại phim",
            description = "Tra cứu toàn bộ thể loại phim có trong hệ thống theo thứ tự bảng chữ cái."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách thể loại thành công")
    })
    @GetMapping("/genres")
    public ResponseEntity<ApiResponse<List<GenreResponse>>> getGenres() {
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách thể loại thành công", movieService.getGenres()));
    }

    @Operation(
            summary = "[PUBLIC] Lấy chi tiết phim theo ID",
            description = "Tra cứu thông tin chi tiết phim bao gồm đạo diễn, diễn viên, thời lượng, thể loại dựa trên UUID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin phim thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phim")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> getMovieById(
            @Parameter(description = "ID của phim (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phim thành công", movieService.getMovieById(id)));
    }

    @Operation(
            summary = "[ADMIN] Tạo phim mới",
            description = "Thêm phim mới vào danh mục hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo phim mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<MovieResponse>> createMovie(@Valid @RequestBody MovieRequest request) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success(201, "Tạo phim mới thành công", movieService.createMovie(request)));
    }

    @Operation(
            summary = "[ADMIN] Cập nhật thông tin phim",
            description = "Cập nhật các trường thông tin của phim đã có trong hệ thống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật phim thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phim"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<MovieResponse>> updateMovie(
            @Parameter(description = "ID của phim cần cập nhật (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID id,
            @Valid @RequestBody MovieRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phim thành công", movieService.updateMovie(id, request)));
    }

    @Operation(
            summary = "[ADMIN] Xóa phim",
            description = "Xóa một phim khỏi danh mục phim.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa phim thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phim"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền ADMIN")
    })
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMovie(
            @Parameter(description = "ID của phim cần xóa (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID id
    ) {
        movieService.deleteMovie(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phim thành công", null));
    }
}
