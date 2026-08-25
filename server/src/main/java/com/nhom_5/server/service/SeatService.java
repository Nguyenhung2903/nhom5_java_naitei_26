package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.BatchSeatTypeRequest;
import com.nhom_5.server.dto.request.SeatRequest;
import com.nhom_5.server.dto.response.SeatResponse;

import java.util.List;
import java.util.UUID;

public interface SeatService {
    List<SeatResponse> getAll();
    List<SeatResponse> getByRoomId(UUID roomId);
    SeatResponse getById(UUID id);
    SeatResponse create(SeatRequest request);
    SeatResponse update(UUID id, SeatRequest request);
    void updateBatchType(BatchSeatTypeRequest request);
    void delete(UUID id);
}


