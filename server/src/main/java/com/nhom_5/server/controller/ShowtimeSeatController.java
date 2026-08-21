package com.nhom_5.server.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.security.access.prepost.PreAuthorize;
import com.nhom_5.server.dto.response.ApiResponse;
import com.nhom_5.server.dto.request.HoldSeatsRequest;
import com.nhom_5.server.dto.response.ShowtimeSeatResponse;
import com.nhom_5.server.service.ShowtimeSeatService;
import com.nhom_5.server.util.SecurityUtil;
import com.nhom_5.server.entity.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/showtimes")
@RequiredArgsConstructor
public class ShowtimeSeatController {
    private final ShowtimeSeatService showtimeSeatService;

    @GetMapping("/{showtimeId}/seats")
    public List<ShowtimeSeatResponse> getSeats(@PathVariable UUID showtimeId) {
        return showtimeSeatService.getSeats(showtimeId);
    }

    @PostMapping("/{showtimeId}/seats/hold")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ApiResponse<String> holdSeats(@PathVariable UUID showtimeId, @RequestBody HoldSeatsRequest request) {
        User currentUser = SecurityUtil.getCurrentUser();
        showtimeSeatService.holdSeats(showtimeId, request.getSeatIds(), currentUser);
        return ApiResponse.success("Đã giữ ghế thành công");
    }
}
