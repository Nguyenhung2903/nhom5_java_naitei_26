package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ShowtimeRequest;
import com.nhom_5.server.dto.response.ShowtimeResponse;

import java.util.List;
import java.time.LocalDate;
import java.util.UUID;

public interface ShowtimeService {
    List<ShowtimeResponse> getAll();
    List<ShowtimeResponse> getByMovieAndTheaterAndDate(UUID movieId, UUID theaterId, LocalDate date);
    ShowtimeResponse getById(UUID id);
    ShowtimeResponse create(ShowtimeRequest request);
    ShowtimeResponse update(UUID id, ShowtimeRequest request);
    void delete(UUID id);
}
