package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.CreateBookingRequest;
import com.nhom_5.server.dto.response.MyBookingResponse;
import java.util.List;

public interface BookingService {
    void createBooking(CreateBookingRequest request);
    List<MyBookingResponse> getMyBookings();
}
