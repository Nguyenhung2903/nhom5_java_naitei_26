package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.TheaterRequest;
import com.nhom_5.server.dto.response.TheaterResponse;
import com.nhom_5.server.entity.Theater;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.repository.TheaterRepository;
import com.nhom_5.server.service.TheaterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TheaterServiceImpl implements TheaterService {
    private final TheaterRepository theaterRepository;
    private final RoomRepository roomRepository;
    private final MovieRepository movieRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TheaterResponse> getAll() {
        return theaterRepository.findAll().stream().map(TheaterResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TheaterResponse> getByMovieId(UUID movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + movieId);
        }
        return theaterRepository.findAllByMovieId(movieId).stream()
                .map(TheaterResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TheaterResponse getById(UUID id) {
        return TheaterResponse.fromEntity(findTheater(id));
    }

    @Override
    @Transactional
    public TheaterResponse create(TheaterRequest request) {
        ensureUniqueName(request.getName(), null);
        Theater theater = Theater.builder()
                .name(request.getName().trim())
                .address(request.getAddress().trim())
                .phone(request.getPhone())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .build();
        return TheaterResponse.fromEntity(theaterRepository.save(theater));
    }

    @Override
    @Transactional
    public TheaterResponse update(UUID id, TheaterRequest request) {
        Theater theater = findTheater(id);
        ensureUniqueName(request.getName(), id);
        theater.setName(request.getName().trim());
        theater.setAddress(request.getAddress().trim());
        theater.setPhone(request.getPhone());
        theater.setLatitude(request.getLatitude());
        theater.setLongitude(request.getLongitude());
        return TheaterResponse.fromEntity(theaterRepository.save(theater));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findTheater(id);
        if (roomRepository.existsByTheaterId(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa rạp đang có phòng chiếu");
        }
        theaterRepository.deleteById(id);
    }

    private Theater findTheater(UUID id) {
        return theaterRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy rạp với ID: " + id));
    }

    private void ensureUniqueName(String name, UUID id) {
        boolean exists = id == null
                ? theaterRepository.existsByNameIgnoreCase(name.trim())
                : theaterRepository.existsByNameIgnoreCaseAndIdNot(name.trim(), id);
        if (exists) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên rạp đã tồn tại");
        }
    }
}
