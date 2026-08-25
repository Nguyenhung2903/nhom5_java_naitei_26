package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.HoldSeatsRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.response.ShowtimeSeatResponse;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.service.ShowtimeSeatService;
import com.nhom_5.server.util.SecurityUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@Tag(name = "08. Trạng thái ghế suất chiếu (Showtime Seats)", description = "Các API xem trạng thái ghế theo suất chiếu và giữ ghế tạm thời")
@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
public class ShowtimeSeatController {

    private final ShowtimeSeatService showtimeSeatService;

    @Operation(
            summary = "[PUBLIC] Lấy sơ đồ và trạng thái ghế theo suất chiếu",
            description = "Tra cứu toàn bộ danh sách ghế của phòng chiếu kèm trạng thái hiện tại (AVAILABLE - Còn trống, HELD - Đang giữ, BOOKED - Đã đặt)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy sơ đồ ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy suất chiếu")
    })
    @GetMapping("/{showtimeId}/seats")
    public List<ShowtimeSeatResponse> getSeats(
            @Parameter(description = "ID suất chiếu (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID showtimeId
    ) {
        return showtimeSeatService.getSeats(showtimeId);
    }

    @Operation(
            summary = "[USER] Giữ ghế tạm thời khi đang đặt vé",
            description = "Tạm khóa ghế đã chọn trong một khoảng thời gian (ví dụ 10 phút) để người dùng tiến hành thanh toán.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đã giữ ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Ghế đã có người khác đặt hoặc đang được giữ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PostMapping("/{showtimeId}/seats/hold")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> holdSeats(
            @Parameter(description = "ID suất chiếu (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID showtimeId,
            @RequestBody HoldSeatsRequest request
    ) {
        User currentUser = SecurityUtil.getCurrentUser();
        showtimeSeatService.holdSeats(showtimeId, request.getSeatIds(), currentUser);
        return ApiResponse.success("Đã giữ ghế thành công");
    }

    @Operation(
            summary = "[USER] Thả ghế đã giữ tạm thời",
            description = "Chủ động hủy giữ ghế khi người dùng đổi ý hoặc hủy luồng đặt vé.",
            security = {@SecurityRequirement(name = "bearerAuth")}
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đã thả ghế thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập")
    })
    @PostMapping("/{showtimeId}/seats/release")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> releaseSeats(
            @Parameter(description = "ID suất chiếu (UUID)", example = "33333333-3333-3333-3333-333333333333")
            @PathVariable UUID showtimeId,
            @RequestBody HoldSeatsRequest request
    ) {
        User currentUser = SecurityUtil.getCurrentUser();
        showtimeSeatService.releaseSeats(showtimeId, request.getSeatIds(), currentUser);
        return ApiResponse.success("Đã thả ghế thành công");
    }
}
