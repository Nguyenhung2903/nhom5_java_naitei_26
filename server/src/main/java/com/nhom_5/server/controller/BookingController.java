package com.nhom_5.server.controller;

import com.nhom_5.server.dto.request.CreateBookingRequest;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import com.nhom_5.server.dto.response.MyBookingResponse;
import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> createBooking(@RequestBody CreateBookingRequest request) {
        bookingService.createBooking(request);
        return ApiResponse.success("Đặt vé thành công");
    }

    @GetMapping("/my-tickets")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<List<MyBookingResponse>> getMyBookings() {
        List<MyBookingResponse> bookings = bookingService.getMyBookings();
        return ApiResponse.success(bookings);
    }
}
