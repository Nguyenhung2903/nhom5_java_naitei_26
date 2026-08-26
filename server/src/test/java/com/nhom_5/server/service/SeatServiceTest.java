package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.SeatRequest;
import com.nhom_5.server.entity.Room;
import com.nhom_5.server.entity.Seat;
import com.nhom_5.server.entity.Theater;
import com.nhom_5.server.entity.enums.SeatType;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.SeatRepository;
import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.service.impl.SeatServiceImpl;
import com.nhom_5.server.repository.ShowtimeRepository;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SeatServiceTest {
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;
    @InjectMocks
    private SeatServiceImpl seatService;

    @Test
    void createRejectsDuplicateSeatInRoom() {
        UUID roomId = UUID.randomUUID();
        SeatRequest request = new SeatRequest();
        request.setRoomId(roomId);
        request.setSeatRow("A");
        request.setSeatNumber(1);
        request.setSeatType(SeatType.NORMAL);
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(Room.builder().id(roomId).build()));
        when(seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(roomId, "A", 1)).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> seatService.create(request));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void deleteRejectsSeatWithBookedOrHeldStatus() {
        UUID seatId = UUID.randomUUID();
        when(seatRepository.findById(seatId)).thenReturn(Optional.of(Seat.builder().id(seatId).build()));
        when(showtimeSeatRepository.existsBySeatIdAndStatusIn(eq(seatId), any())).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> seatService.delete(seatId));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void createReturnsSavedSeat() {
        UUID roomId = UUID.randomUUID();
        Theater theater = Theater.builder().id(UUID.randomUUID()).name("CGV").build();
        Room room = Room.builder().id(roomId).name("Room 1").theater(theater).build();
        SeatRequest request = new SeatRequest();
        request.setRoomId(roomId);
        request.setSeatRow("A");
        request.setSeatNumber(1);
        request.setSeatType(SeatType.VIP);
        Seat saved = Seat.builder().id(UUID.randomUUID()).room(room).seatRow("A").seatNumber(1).seatType(SeatType.VIP).build();
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(seatRepository.existsByRoomIdAndSeatRowIgnoreCaseAndSeatNumber(roomId, "A", 1)).thenReturn(false);
        when(seatRepository.save(any(Seat.class))).thenReturn(saved);

        assertEquals(saved.getId(), seatService.create(request).getId());
    }
}
