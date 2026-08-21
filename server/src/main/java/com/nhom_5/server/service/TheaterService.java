package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.TheaterRequest;
import com.nhom_5.server.dto.response.TheaterResponse;

import java.util.List;
import java.util.UUID;

public interface TheaterService {
    List<TheaterResponse> getAll();
    List<TheaterResponse> getByMovieId(UUID movieId);
    TheaterResponse getById(UUID id);
    TheaterResponse create(TheaterRequest request);
    TheaterResponse update(UUID id, TheaterRequest request);
    void delete(UUID id);
}
