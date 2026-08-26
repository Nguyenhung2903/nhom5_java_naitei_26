package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.BatchSeatDeleteRequest;
import com.nhom_5.server.dto.request.BatchSeatTypeRequest;
import com.nhom_5.server.dto.request.CreateRowSeatRequest;
import com.nhom_5.server.dto.request.SeatRequest;
import com.nhom_5.server.dto.response.SeatResponse;
import com.nhom_5.server.entity.Room;
import com.nhom_5.server.entity.Seat;
import com.nhom_5.server.entity.Showtime;
import com.nhom_5.server.entity.ShowtimeSeat;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;
import com.nhom_5.server.entity.enums.ShowtimeStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.SeatRepository;
import com.nhom_5.server.repository.ShowtimeRepository;
import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {
    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;
    private final ShowtimeRepository showtimeRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponse> getAll() {
        return seatRepository.findAll().stream().map(SeatResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SeatResponse> getByRoomId(UUID roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + roomId);
        }
        return seatRepository.findByRoomIdOrderBySeatRowAscSeatNumberAsc(roomId)
                .stream()
                .map(SeatResponse::fromEntity)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SeatResponse getById(UUID id) {
        return SeatResponse.fromEntity(findSeat(id));
    }

    @Override
    @Transactional
    public SeatResponse create(SeatRequest request) {
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        ensureUnique(request, null);
        Seat seat = Seat.builder()
                .room(room)
                .seatRow(request.getSeatRow().trim().toUpperCase())
                .seatNumber(request.getSeatNumber())
                .seatType(request.getSeatType())
                .build();
        Seat savedSeat = seatRepository.save(seat);

        // Tự động đồng bộ ghế mới vào các suất chiếu mở bán tương lai của phòng
        syncNewSeatsToFutureShowtimes(room.getId(), List.of(savedSeat));

        return SeatResponse.fromEntity(savedSeat);
    }

    @Override
    @Transactional
    public List<SeatResponse> createRow(CreateRowSeatRequest request) {
        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));

        String seatRow = request.getSeatRow().trim().toUpperCase();
        int count = request.getSeatCount();

        List<Seat> seatsToSave = new ArrayList<>();
        for (int number = 1; number <= count; number++) {
            if (seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(request.getRoomId(), seatRow, number)) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Ghế " + seatRow + number + " đã tồn tại trong phòng");
            }
            seatsToSave.add(Seat.builder()
                    .room(room)
                    .seatRow(seatRow)
                    .seatNumber(number)
                    .seatType(request.getSeatType())
                    .build());
        }

        List<Seat> savedSeats = seatRepository.saveAll(seatsToSave);

        // Tự động đồng bộ hàng ghế mới vào các suất chiếu mở bán tương lai của phòng
        syncNewSeatsToFutureShowtimes(room.getId(), savedSeats);

        return savedSeats.stream().map(SeatResponse::fromEntity).toList();
    }

    @Override
    @Transactional
    public SeatResponse update(UUID id, SeatRequest request) {
        Seat seat = findSeat(id);
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        ensureUnique(request, id);
        seat.setRoom(room);
        seat.setSeatRow(request.getSeatRow().trim().toUpperCase());
        seat.setSeatNumber(request.getSeatNumber());
        seat.setSeatType(request.getSeatType());
        Seat updatedSeat = seatRepository.save(seat);

        // Đồng bộ cập nhật giá cho các suất chiếu tương lai có ghế khả dụng
        updateShowtimeSeatPriceForAvailableSeats(List.of(seat.getId()), request.getSeatType());

        return SeatResponse.fromEntity(updatedSeat);
    }

    @Override
    @Transactional
    public void updateBatchType(BatchSeatTypeRequest request) {
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Danh sách ID ghế không được để trống");
        }
        List<Seat> seats = seatRepository.findAllById(request.getSeatIds());
        if (seats.isEmpty()) {
            throw new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy ghế nào phù hợp với danh sách ID");
        }
        for (Seat seat : seats) {
            seat.setSeatType(request.getSeatType());
        }
        seatRepository.saveAll(seats);

        // Cập nhật giá vé tương ứng cho các ghế ở trạng thái AVAILABLE của suất chiếu
        updateShowtimeSeatPriceForAvailableSeats(request.getSeatIds(), request.getSeatType());
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findSeat(id);
        boolean hasBookedOrHeld = showtimeSeatRepository.existsBySeatIdAndStatusIn(
                id, List.of(ShowtimeSeatStatus.BOOKED, ShowtimeSeatStatus.HELD));
        if (hasBookedOrHeld) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa ghế đã có khách đặt hoặc đang giữ chỗ trong suất chiếu");
        }

        // Xóa các liên kết ShowtimeSeat khả dụng trước khi xóa ghế
        showtimeSeatRepository.deleteBySeatId(id);
        showtimeSeatRepository.flush();

        seatRepository.deleteById(id);
    }

    @Override
    @Transactional
    public void deleteBatch(BatchSeatDeleteRequest request) {
        if (request.getSeatIds() == null || request.getSeatIds().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Danh sách ID ghế cần xóa không được để trống");
        }

        boolean hasBookedOrHeld = showtimeSeatRepository.existsBySeatIdInAndStatusIn(
                request.getSeatIds(), List.of(ShowtimeSeatStatus.BOOKED, ShowtimeSeatStatus.HELD));
        if (hasBookedOrHeld) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Một hoặc nhiều ghế đã có khách đặt hoặc đang giữ chỗ, không thể xóa");
        }

        // Xóa toàn bộ ShowtimeSeat liên quan ở trạng thái khả dụng
        showtimeSeatRepository.deleteBySeatIdIn(request.getSeatIds());
        showtimeSeatRepository.flush();

        seatRepository.deleteAllById(request.getSeatIds());
    }

    private void syncNewSeatsToFutureShowtimes(UUID roomId, List<Seat> newSeats) {
        List<Showtime> futureOpenShowtimes = showtimeRepository.findByRoomIdAndStatusAndStartTimeAfter(
                roomId, ShowtimeStatus.OPEN, Instant.now());

        if (!futureOpenShowtimes.isEmpty() && !newSeats.isEmpty()) {
            List<ShowtimeSeat> showtimeSeatsToCreate = new ArrayList<>();
            for (Showtime showtime : futureOpenShowtimes) {
                for (Seat seat : newSeats) {
                    showtimeSeatsToCreate.add(ShowtimeSeat.builder()
                            .showtime(showtime)
                            .seat(seat)
                            .price(ShowtimeServiceImpl.calculateSeatPrice(seat.getSeatType()))
                            .status(ShowtimeSeatStatus.AVAILABLE)
                            .build());
                }
            }
            showtimeSeatRepository.saveAll(showtimeSeatsToCreate);
        }
    }

    private void updateShowtimeSeatPriceForAvailableSeats(List<UUID> seatIds, com.nhom_5.server.entity.enums.SeatType newSeatType) {
        List<ShowtimeSeat> availableShowtimeSeats = showtimeSeatRepository.findBySeatIdInAndStatus(
                seatIds, ShowtimeSeatStatus.AVAILABLE);
        if (!availableShowtimeSeats.isEmpty()) {
            var newPrice = ShowtimeServiceImpl.calculateSeatPrice(newSeatType);
            for (ShowtimeSeat ss : availableShowtimeSeats) {
                ss.setPrice(newPrice);
            }
            showtimeSeatRepository.saveAll(availableShowtimeSeats);
        }
    }

    private Seat findSeat(UUID id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy ghế với ID: " + id));
    }

    private void ensureUnique(SeatRequest request, UUID id) {
        String seatRow = request.getSeatRow().trim().toUpperCase();
        boolean exists = id == null
                ? seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(request.getRoomId(), seatRow, request.getSeatNumber())
                : seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumberAndIdNot(request.getRoomId(), seatRow, request.getSeatNumber(), id);
        if (exists) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số ghế đã tồn tại trong phòng");
        }
    }
}

