package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ShowtimeRequest;
import com.nhom_5.server.dto.response.ShowtimeResponse;

import java.util.List;
import java.util.UUID;

public interface ShowtimeService {
    List<ShowtimeResponse> getAll();
    ShowtimeResponse getById(UUID id);
    ShowtimeResponse create(ShowtimeRequest request);
    ShowtimeResponse update(UUID id, ShowtimeRequest request);
    void delete(UUID id);
}
