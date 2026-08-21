package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.ShowtimeRequest;
import com.nhom_5.server.dto.response.ShowtimeResponse;
import com.nhom_5.server.entity.Showtime;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.ShowtimeRepository;
import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {
    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAll() {
        return showtimeRepository.findAll().stream().map(ShowtimeResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getById(UUID id) {
        return ShowtimeResponse.fromEntity(findShowtime(id));
    }

    @Override
    @Transactional
    public ShowtimeResponse create(ShowtimeRequest request) {
        validateTime(request);
        var movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + request.getMovieId()));
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        Showtime showtime = Showtime.builder()
                .movie(movie)
                .room(room)
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .status(request.getStatus())
                .build();
        return ShowtimeResponse.fromEntity(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public ShowtimeResponse update(UUID id, ShowtimeRequest request) {
        validateTime(request);
        Showtime showtime = findShowtime(id);
        var movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + request.getMovieId()));
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(request.getEndTime());
        showtime.setStatus(request.getStatus());
        return ShowtimeResponse.fromEntity(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findShowtime(id);
        if (showtimeSeatRepository.existsByShowtimeId(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa suất chiếu đã có dữ liệu ghế");
        }
        showtimeRepository.deleteById(id);
    }

    private Showtime findShowtime(UUID id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy suất chiếu với ID: " + id));
    }

    private void validateTime(ShowtimeRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Thời gian bắt đầu phải trước thời gian kết thúc");
        }
    }
}
