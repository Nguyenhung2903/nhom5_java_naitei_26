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
import com.nhom_5.server.repository.TheaterRepository;
import com.nhom_5.server.service.ShowtimeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nhom_5.server.entity.Seat;
import com.nhom_5.server.entity.ShowtimeSeat;
import com.nhom_5.server.entity.enums.SeatType;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;
import com.nhom_5.server.entity.enums.ShowtimeStatus;
import com.nhom_5.server.repository.SeatRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.Duration;
import java.util.UUID;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;

@Service
@RequiredArgsConstructor
public class ShowtimeServiceImpl implements ShowtimeService {
    private static final ZoneId BUSINESS_TIME_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final RoomRepository roomRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final TheaterRepository theaterRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAll(UUID movieId, UUID theaterId, UUID roomId, LocalDate date, ShowtimeStatus status) {
        var startOfDay = date == null ? null : date.atStartOfDay(BUSINESS_TIME_ZONE).toInstant();
        var startOfNextDay = date == null ? null : date.plusDays(1).atStartOfDay(BUSINESS_TIME_ZONE).toInstant();
        Specification<Showtime> specification = (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (movieId != null) predicates.add(criteriaBuilder.equal(root.get("movie").get("id"), movieId));
            if (theaterId != null) predicates.add(criteriaBuilder.equal(root.get("room").get("theater").get("id"), theaterId));
            if (roomId != null) predicates.add(criteriaBuilder.equal(root.get("room").get("id"), roomId));
            if (startOfDay != null) predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("startTime"), startOfDay));
            if (startOfNextDay != null) predicates.add(criteriaBuilder.lessThan(root.get("startTime"), startOfNextDay));
            if (status != null) predicates.add(criteriaBuilder.equal(root.get("status"), status));
            query.orderBy(criteriaBuilder.asc(root.get("startTime")));
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
        return showtimeRepository.findAll(specification)
                .stream().map(ShowtimeResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getByMovieAndTheaterAndDate(UUID movieId, UUID theaterId, LocalDate date) {
        if (!movieRepository.existsById(movieId)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + movieId);
        }
        if (!theaterRepository.existsById(theaterId)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy rạp với ID: " + theaterId);
        }

        var startTime = date.atStartOfDay(BUSINESS_TIME_ZONE).toInstant();
        var endTime = date.plusDays(1).atStartOfDay(BUSINESS_TIME_ZONE).toInstant();
        return showtimeRepository.findAllByMovieIdAndTheaterIdAndStartTimeBetween(
                        movieId, theaterId, startTime, endTime)
                .stream()
                .map(ShowtimeResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getById(UUID id) {
        return ShowtimeResponse.fromEntity(findShowtime(id));
    }

    @Override
    @Transactional
    public ShowtimeResponse create(ShowtimeRequest request) {
        var movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + request.getMovieId()));
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        var endTime = calculateEndTime(request.getStartTime(), movie.getDuration());
        validateNoOverlap(room.getId(), request.getStartTime(), endTime, null);
        Showtime showtime = Showtime.builder()
                .movie(movie)
                .room(room)
                .startTime(request.getStartTime())
            .endTime(endTime)
                .status(request.getStatus())
                .build();
        Showtime savedShowtime = showtimeRepository.save(showtime);

        // Tự động khởi tạo dữ liệu ghế cho suất chiếu (ShowtimeSeat) dựa trên danh sách ghế của phòng
        List<Seat> roomSeats = seatRepository.findByRoomIdOrderBySeatRowAscSeatNumberAsc(room.getId());
        if (!roomSeats.isEmpty()) {
            List<ShowtimeSeat> showtimeSeats = new ArrayList<>();
            for (Seat seat : roomSeats) {
                BigDecimal price = calculateSeatPrice(seat.getSeatType());
                showtimeSeats.add(ShowtimeSeat.builder()
                        .showtime(savedShowtime)
                        .seat(seat)
                        .price(price)
                        .status(ShowtimeSeatStatus.AVAILABLE)
                        .build());
            }
            showtimeSeatRepository.saveAll(showtimeSeats);
        }

        return ShowtimeResponse.fromEntity(savedShowtime);
    }

    private BigDecimal calculateSeatPrice(SeatType seatType) {
        if (seatType == null) {
            return BigDecimal.valueOf(75000);
        }
        return switch (seatType) {
            case VIP -> BigDecimal.valueOf(95000);
            case COUPLE -> BigDecimal.valueOf(160000);
            case NORMAL -> BigDecimal.valueOf(75000);
        };
    }


    @Override
    @Transactional
    public ShowtimeResponse update(UUID id, ShowtimeRequest request) {
        Showtime showtime = findShowtime(id);
        var movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phim với ID: " + request.getMovieId()));
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        var endTime = calculateEndTime(request.getStartTime(), movie.getDuration());
        validateNoOverlap(room.getId(), request.getStartTime(), endTime, id);
        showtime.setMovie(movie);
        showtime.setRoom(room);
        showtime.setStartTime(request.getStartTime());
        showtime.setEndTime(endTime);
        showtime.setStatus(request.getStatus());
        return ShowtimeResponse.fromEntity(showtimeRepository.save(showtime));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findShowtime(id);
        if (showtimeSeatRepository.existsByShowtimeIdAndStatusIn(id,
                List.of(ShowtimeSeatStatus.BOOKED, ShowtimeSeatStatus.HELD))) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa suất chiếu đang có ghế được đặt hoặc giữ chỗ");
        }
        showtimeSeatRepository.deleteByShowtimeId(id);
        showtimeRepository.deleteById(id);
    }

    private Showtime findShowtime(UUID id) {
        return showtimeRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy suất chiếu với ID: " + id));
    }

    private java.time.Instant calculateEndTime(java.time.Instant startTime, Integer durationMinutes) {
        if (durationMinutes == null || durationMinutes <= 0) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Thời lượng phim phải lớn hơn 0 phút");
        }
        return startTime.plus(Duration.ofMinutes(durationMinutes));
    }

    private void validateNoOverlap(UUID roomId, java.time.Instant startTime, java.time.Instant endTime, UUID excludedId) {
        if (showtimeRepository.existsOverlappingShowtime(roomId, startTime, endTime, excludedId)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Phòng chiếu đã có suất chiếu trong khoảng thời gian này");
        }
    }
}
