package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.RoomRequest;
import com.nhom_5.server.dto.response.RoomResponse;

import java.util.List;
import java.util.UUID;

public interface RoomService {
    List<RoomResponse> getAll();
    RoomResponse getById(UUID id);
    RoomResponse create(RoomRequest request);
    RoomResponse update(UUID id, RoomRequest request);
    void delete(UUID id);
}
