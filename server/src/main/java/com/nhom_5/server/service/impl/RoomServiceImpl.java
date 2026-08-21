package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.RoomRequest;
import com.nhom_5.server.dto.response.RoomResponse;
import com.nhom_5.server.entity.Room;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.SeatRepository;
import com.nhom_5.server.repository.ShowtimeRepository;
import com.nhom_5.server.repository.TheaterRepository;
import com.nhom_5.server.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {
    private final RoomRepository roomRepository;
    private final TheaterRepository theaterRepository;
    private final SeatRepository seatRepository;
    private final ShowtimeRepository showtimeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getAll() {
        return roomRepository.findAll().stream().map(RoomResponse::fromEntity).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(UUID id) {
        return RoomResponse.fromEntity(findRoom(id));
    }

    @Override
    @Transactional
    public RoomResponse create(RoomRequest request) {
        var theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy rạp với ID: " + request.getTheaterId()));
        ensureUniqueName(request, null);
        Room room = Room.builder().theater(theater).name(request.getName().trim()).build();
        return RoomResponse.fromEntity(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse update(UUID id, RoomRequest request) {
        Room room = findRoom(id);
        var theater = theaterRepository.findById(request.getTheaterId())
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy rạp với ID: " + request.getTheaterId()));
        ensureUniqueName(request, id);
        room.setTheater(theater);
        room.setName(request.getName().trim());
        return RoomResponse.fromEntity(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void delete(UUID id) {
        findRoom(id);
        if (seatRepository.existsByRoomId(id) || showtimeRepository.existsByRoomId(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa phòng đang có ghế hoặc suất chiếu");
        }
        roomRepository.deleteById(id);
    }

    private Room findRoom(UUID id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy phòng với ID: " + id));
    }

    private void ensureUniqueName(RoomRequest request, UUID id) {
        String name = request.getName().trim();
        boolean exists = id == null
                ? roomRepository.existsByTheaterIdAndNameIgnoreCase(request.getTheaterId(), name)
                : roomRepository.existsByTheaterIdAndNameIgnoreCaseAndIdNot(request.getTheaterId(), name, id);
        if (exists) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Tên phòng đã tồn tại trong rạp");
        }
    }
}
