package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.SeatRequest;
import com.nhom_5.server.dto.response.SeatResponse;
import com.nhom_5.server.entity.Seat;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.SeatRepository;
import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.service.SeatService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SeatServiceImpl implements SeatService {
    private final SeatRepository seatRepository;
    private final RoomRepository roomRepository;
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
                .seatRow(request.getSeatRow().trim())
                .seatNumber(request.getSeatNumber())
                .seatType(request.getSeatType())
                .build();
        return SeatResponse.fromEntity(seatRepository.save(seat));
    }

    @Override
    @Transactional
    public SeatResponse update(UUID id, SeatRequest request) {
        Seat seat = findSeat(id);
        var room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + request.getRoomId()));
        ensureUnique(request, id);
        seat.setRoom(room);
        seat.setSeatRow(request.getSeatRow().trim());
        seat.setSeatNumber(request.getSeatNumber());
        seat.setSeatType(request.getSeatType());
        return SeatResponse.fromEntity(seatRepository.save(seat));
    }

    @Override
    @Transactional
    public void updateBatchType(com.nhom_5.server.dto.request.BatchSeatTypeRequest request) {
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
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findSeat(id);
        if (showtimeSeatRepository.existsBySeatId(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa ghế đã được gán cho suất chiếu");
        }

        seatRepository.deleteById(id);
    }

    private Seat findSeat(UUID id) {
        return seatRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy ghế với ID: " + id));
    }

    private void ensureUnique(SeatRequest request, UUID id) {
        String seatRow = request.getSeatRow().trim();
        boolean exists = id == null
                ? seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(request.getRoomId(), seatRow, request.getSeatNumber())
                : seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumberAndIdNot(request.getRoomId(), seatRow, request.getSeatNumber(), id);
        if (exists) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Số ghế đã tồn tại trong phòng");
        }
    }
}
