package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.RoomRequest;
import com.nhom_5.server.entity.Room;
import com.nhom_5.server.entity.Theater;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.SeatRepository;
import com.nhom_5.server.repository.ShowtimeRepository;
import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.repository.TheaterRepository;
import com.nhom_5.server.service.impl.RoomServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RoomServiceTest {
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private TheaterRepository theaterRepository;
    @Mock
    private SeatRepository seatRepository;
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;
    @InjectMocks
    private RoomServiceImpl roomService;

    @Test
    void createRejectsMissingTheater() {
        UUID theaterId = UUID.randomUUID();
        RoomRequest request = new RoomRequest();
        request.setTheaterId(theaterId);
        request.setName("Room 1");
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> roomService.create(request));

        assertEquals(ErrorCode.NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void deleteRejectsRoomWhenShowtimeHasBookedOrHeldSeats() {
        UUID roomId = UUID.randomUUID();
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(Room.builder().id(roomId).build()));
        when(showtimeSeatRepository.existsBookedOrHeldByRoomId(eq(roomId), any())).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> roomService.delete(roomId));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void deleteSuccessfullyDeletesShowtimeSeatsShowtimesSeatsAndRoom() {
        UUID roomId = UUID.randomUUID();
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(Room.builder().id(roomId).build()));
        when(showtimeSeatRepository.existsBookedOrHeldByRoomId(eq(roomId), any())).thenReturn(false);

        roomService.delete(roomId);

        verify(showtimeSeatRepository).deleteByRoomIdCascade(roomId);
        verify(showtimeSeatRepository).flush();
        verify(showtimeRepository).deleteByRoomId(roomId);
        verify(showtimeRepository).flush();
        verify(seatRepository).deleteByRoomId(roomId);
        verify(seatRepository).flush();
        verify(roomRepository).deleteById(roomId);
    }

    @Test
    void createReturnsSavedRoom() {
        UUID theaterId = UUID.randomUUID();
        Theater theater = Theater.builder().id(theaterId).name("CGV").build();
        RoomRequest request = new RoomRequest();
        request.setTheaterId(theaterId);
        request.setName("Room 1");
        Room saved = Room.builder().id(UUID.randomUUID()).theater(theater).name("Room 1").build();
        when(theaterRepository.findById(theaterId)).thenReturn(Optional.of(theater));
        when(roomRepository.existsByTheaterIdAndNameIgnoreCase(theaterId, "Room 1")).thenReturn(false);
        when(roomRepository.save(any(Room.class))).thenReturn(saved);

        assertEquals(saved.getId(), roomService.create(request).getId());
    }

    @Test
    void resetSeatsRejectsRoomWithShowtimes() {
        UUID roomId = UUID.randomUUID();
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(Room.builder().id(roomId).build()));
        when(showtimeRepository.existsByRoomId(roomId)).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> roomService.resetSeats(roomId));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void resetSeatsSuccessfullyDeletesFlushesAndGeneratesSeats() {
        UUID roomId = UUID.randomUUID();
        Room room = Room.builder().id(roomId).name("Phòng 1").build();
        when(roomRepository.findById(roomId)).thenReturn(Optional.of(room));
        when(showtimeRepository.existsByRoomId(roomId)).thenReturn(false);

        roomService.resetSeats(roomId);

        org.mockito.Mockito.verify(seatRepository).deleteByRoomId(roomId);
        org.mockito.Mockito.verify(seatRepository).flush();
        org.mockito.Mockito.verify(seatRepository).saveAll(any());
    }
}

