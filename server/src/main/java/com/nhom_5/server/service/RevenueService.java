package com.nhom_5.server.service;

import com.nhom_5.server.dto.response.revenue.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface RevenueService {

    RevenueOverviewResponse getOverview(Instant startDate, Instant endDate, UUID movieId, UUID theaterId);

    List<RevenueTimePointResponse> getTimeSeriesRevenue(Instant startDate, Instant endDate, String groupBy, UUID movieId, UUID theaterId);

    List<MovieRevenueResponse> getRevenueByMovies(Instant startDate, Instant endDate, UUID theaterId, Integer limit);

    List<TheaterRevenueResponse> getRevenueByTheaters(Instant startDate, Instant endDate, UUID movieId);

    List<AdminBookingDetailResponse> getAdminBookings(Instant startDate, Instant endDate, UUID movieId, UUID theaterId, String search, String status);
}
