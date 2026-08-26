package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.CreateBookingRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.MyBookingResponse;
import com.nhom_5.server.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "10. Đặt vé (Bookings)", description = "Các API tạo đơn đặt vé xem phim, xem lịch sử đặt vé cá nhân và quản lý đơn vé")
@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @Operation(
            summary = "[USER] Tạo đơn đặt vé xem phim mới",
            description = "Tạo đơn đặt vé gồm suất chiếu, danh sách ghế, combo bắp nước, áp dụng mã khuyến mãi và phương thức thanh toán.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đặt vé thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Ghế không hợp lệ, suất chiếu không tồn tại hoặc mã giảm giá hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> createBooking(@RequestBody CreateBookingRequest request) {
        bookingService.createBooking(request);
        return ApiResponse.success("Đặt vé thành công");
    }

    @Operation(
            summary = "[USER] Lấy lịch sử vé đã đặt của người dùng hiện tại",
            description = "Tra cứu toàn bộ danh sách vé đã đặt kèm mã vé, chi tiết phim, phòng, ghế, combo và trạng thái thanh toán.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy lịch sử vé thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @GetMapping("/my-tickets")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<List<MyBookingResponse>> getMyBookings() {
        List<MyBookingResponse> bookings = bookingService.getMyBookings();
        return ApiResponse.success("Lấy lịch sử đặt vé thành công", bookings);
    }

    @Operation(
            summary = "[USER] Hủy đơn đặt vé xem phim",
            description = "Cho phép người dùng hủy vé trước khi suất chiếu bắt đầu và hoàn trả lại trạng thái ghế trống.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Hủy vé thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Suất chiếu đã bắt đầu hoặc đơn vé không thể hủy"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền hủy đơn vé này"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy đơn đặt vé")
    })
    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> cancelBooking(@org.springframework.web.bind.annotation.PathVariable java.util.UUID id) {
        bookingService.cancelBooking(id);
        return ApiResponse.success("Hủy vé thành công");
    }
}
