package com.nhom_5.server.controller;

import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.revenue.*;
import com.nhom_5.server.service.RevenueService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Tag(name = "15. Quản lý & Thống kê Doanh thu (Admin Revenue)", description = "Các API thống kê, phân tích doanh thu phòng vé theo phim, theo rạp, theo mốc thời gian và quản lý danh sách đơn vé")
@RestController
@RequestMapping("/admin/revenue")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class RevenueController {

    private final RevenueService revenueService;

    @Operation(
            summary = "[ADMIN] Lấy các chỉ số KPI tổng quan doanh thu",
            description = "Trả về tổng doanh thu (Vé + Combo), tổng số vé bán ra, tổng đơn hàng, AOV và tỷ lệ tăng trưởng.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy KPI tổng quan thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền quản trị viên")
    })
    @GetMapping("/overview")
    public ApiResponse<RevenueOverviewResponse> getRevenueOverview(
            @Parameter(description = "Thời điểm bắt đầu (ISO-8601 UTC)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @Parameter(description = "Thời điểm kết thúc (ISO-8601 UTC)")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @Parameter(description = "Lọc theo ID phim cụ thể")
            @RequestParam(required = false) UUID movieId,
            @Parameter(description = "Lọc theo ID cụm rạp cụ thể")
            @RequestParam(required = false) UUID theaterId
    ) {
        RevenueOverviewResponse overview = revenueService.getOverview(startDate, endDate, movieId, theaterId);
        return ApiResponse.success("Lấy tổng quan doanh thu thành công", overview);
    }

    @Operation(
            summary = "[ADMIN] Lấy dữ liệu chuỗi thời gian doanh thu (Time-Series)",
            description = "Trả về danh sách doanh thu theo từng ngày hoặc từng tháng để vẽ biểu đồ đường/cột xu hướng.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @GetMapping("/time-series")
    public ApiResponse<List<RevenueTimePointResponse>> getTimeSeriesRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @Parameter(description = "Kiểu nhóm: 'day' (theo ngày) hoặc 'month' (theo tháng)", example = "day")
            @RequestParam(defaultValue = "day") String groupBy,
            @RequestParam(required = false) UUID movieId,
            @RequestParam(required = false) UUID theaterId
    ) {
        List<RevenueTimePointResponse> timeSeries = revenueService.getTimeSeriesRevenue(startDate, endDate, groupBy, movieId, theaterId);
        return ApiResponse.success("Lấy biểu đồ doanh thu theo thời gian thành công", timeSeries);
    }

    @Operation(
            summary = "[ADMIN] Lấy xếp hạng doanh thu theo từng bộ phim (Box Office Ranking)",
            description = "Trả về danh sách phim sắp xếp theo doanh thu cao nhất, kèm số vé bán ra và tỷ trọng đóng góp.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @GetMapping("/by-movie")
    public ApiResponse<List<MovieRevenueResponse>> getRevenueByMovies(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) UUID theaterId,
            @Parameter(description = "Giới hạn số lượng phim trả về (VD: top 10)", example = "10")
            @RequestParam(required = false) Integer limit
    ) {
        List<MovieRevenueResponse> list = revenueService.getRevenueByMovies(startDate, endDate, theaterId, limit);
        return ApiResponse.success("Lấy doanh thu theo phim thành công", list);
    }

    @Operation(
            summary = "[ADMIN] Lấy cơ cấu doanh thu theo từng Cụm Rạp Chiếu Phim",
            description = "Trả về danh sách các cụm rạp sắp xếp theo doanh thu cao nhất kèm số phòng, số vé và tỷ trọng.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @GetMapping("/by-theater")
    public ApiResponse<List<TheaterRevenueResponse>> getRevenueByTheaters(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) UUID movieId
    ) {
        List<TheaterRevenueResponse> list = revenueService.getRevenueByTheaters(startDate, endDate, movieId);
        return ApiResponse.success("Lấy doanh thu theo cụm rạp thành công", list);
    }

    @Operation(
            summary = "[ADMIN] Lấy danh sách chi tiết các đơn đặt vé (Transactions & Bookings)",
            description = "Trả về danh sách chi tiết các đơn đặt vé kèm thông tin khách hàng, ghế, combo, số tiền và trạng thái để quản lý và đối soát.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @GetMapping("/bookings")
    public ApiResponse<List<AdminBookingDetailResponse>> getAdminBookings(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) Instant endDate,
            @RequestParam(required = false) UUID movieId,
            @RequestParam(required = false) UUID theaterId,
            @Parameter(description = "Từ khóa tìm kiếm (mã vé, tên khách, email, SĐT)")
            @RequestParam(required = false) String search,
            @Parameter(description = "Lọc theo trạng thái thanh toán (PAID, UNPAID, CANCELLED, ALL)", example = "ALL")
            @RequestParam(defaultValue = "ALL") String status
    ) {
        List<AdminBookingDetailResponse> list = revenueService.getAdminBookings(startDate, endDate, movieId, theaterId, search, status);
        return ApiResponse.success("Lấy danh sách đơn đặt vé thành công", list);
    }
}
