package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.CreateBookingRequest;

public interface BookingService {
    void createBooking(CreateBookingRequest request);
}
