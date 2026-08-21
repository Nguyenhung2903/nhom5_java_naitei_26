package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ShowtimeRequest;
import com.nhom_5.server.entity.Movie;
import com.nhom_5.server.entity.Room;
import com.nhom_5.server.entity.Showtime;
import com.nhom_5.server.entity.Theater;
import com.nhom_5.server.entity.enums.ShowtimeStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.MovieRepository;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.ShowtimeRepository;
import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.repository.TheaterRepository;
import com.nhom_5.server.service.impl.ShowtimeServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ShowtimeServiceTest {
    @Mock
    private ShowtimeRepository showtimeRepository;
    @Mock
    private MovieRepository movieRepository;
    @Mock
    private RoomRepository roomRepository;
    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;
    @Mock
    private TheaterRepository theaterRepository;
    @InjectMocks
    private ShowtimeServiceImpl showtimeService;

    @Test
    void createRejectsEndBeforeStart() {
        ShowtimeRequest request = request(Instant.parse("2026-08-20T12:00:00Z"), Instant.parse("2026-08-20T11:00:00Z"));

        AppException exception = assertThrows(AppException.class, () -> showtimeService.create(request));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void createRejectsMissingMovie() {
        ShowtimeRequest request = request(Instant.parse("2026-08-20T11:00:00Z"), Instant.parse("2026-08-20T12:00:00Z"));
        when(movieRepository.findById(request.getMovieId())).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> showtimeService.create(request));

        assertEquals(ErrorCode.NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void deleteRejectsShowtimeWithSeats() {
        UUID showtimeId = UUID.randomUUID();
        Theater theater = Theater.builder().id(UUID.randomUUID()).name("CGV").build();
        Room room = Room.builder().id(UUID.randomUUID()).name("Room 1").theater(theater).build();
        Movie movie = Movie.builder().id(UUID.randomUUID()).title("Movie").build();
        when(showtimeRepository.findById(showtimeId)).thenReturn(Optional.of(Showtime.builder().id(showtimeId).movie(movie).room(room).build()));
        when(showtimeSeatRepository.existsByShowtimeId(showtimeId)).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> showtimeService.delete(showtimeId));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

        @Test
        void getByMovieAndTheaterAndDateRejectsMissingMovie() {
        UUID movieId = UUID.randomUUID();
        UUID theaterId = UUID.randomUUID();
        when(movieRepository.existsById(movieId)).thenReturn(false);

        AppException exception = assertThrows(AppException.class, () -> showtimeService
            .getByMovieAndTheaterAndDate(movieId, theaterId, java.time.LocalDate.of(2026, 8, 20)));

        assertEquals(ErrorCode.NOT_FOUND, exception.getErrorCode());
        }

        @Test
        void getByMovieAndTheaterAndDateRejectsMissingTheater() {
        UUID movieId = UUID.randomUUID();
        UUID theaterId = UUID.randomUUID();
        when(movieRepository.existsById(movieId)).thenReturn(true);
        when(theaterRepository.existsById(theaterId)).thenReturn(false);

        AppException exception = assertThrows(AppException.class, () -> showtimeService
            .getByMovieAndTheaterAndDate(movieId, theaterId, java.time.LocalDate.of(2026, 8, 20)));

        assertEquals(ErrorCode.NOT_FOUND, exception.getErrorCode());
        }

        @Test
        void getByMovieAndTheaterAndDateReturnsRepositoryResults() {
        UUID movieId = UUID.randomUUID();
        UUID theaterId = UUID.randomUUID();
        Theater theater = Theater.builder().id(theaterId).name("Cinema A").build();
        Room room = Room.builder().id(UUID.randomUUID()).name("Room 1").theater(theater).build();
        Movie movie = Movie.builder().id(movieId).title("Movie").build();
        Showtime showtime = Showtime.builder()
            .id(UUID.randomUUID())
            .movie(movie)
            .room(room)
            .startTime(Instant.parse("2026-08-20T03:00:00Z"))
            .endTime(Instant.parse("2026-08-20T05:00:00Z"))
            .status(ShowtimeStatus.OPEN)
            .build();
        when(movieRepository.existsById(movieId)).thenReturn(true);
        when(theaterRepository.existsById(theaterId)).thenReturn(true);
        when(showtimeRepository.findAllByMovieIdAndTheaterIdAndStartTimeBetween(
            eq(movieId), eq(theaterId), any(Instant.class), any(Instant.class)))
            .thenReturn(List.of(showtime));

        assertEquals(1, showtimeService
            .getByMovieAndTheaterAndDate(movieId, theaterId, java.time.LocalDate.of(2026, 8, 20)).size());
        }

    private ShowtimeRequest request(Instant start, Instant end) {
        ShowtimeRequest request = new ShowtimeRequest();
        request.setMovieId(UUID.randomUUID());
        request.setRoomId(UUID.randomUUID());
        request.setStartTime(start);
        request.setEndTime(end);
        request.setStatus(ShowtimeStatus.OPEN);
        return request;
    }
}
