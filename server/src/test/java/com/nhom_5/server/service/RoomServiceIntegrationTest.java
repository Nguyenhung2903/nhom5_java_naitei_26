package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.RoomRequest;
import com.nhom_5.server.dto.response.RoomResponse;
import com.nhom_5.server.entity.Theater;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.SeatRepository;
import com.nhom_5.server.repository.TheaterRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class RoomServiceIntegrationTest {

    @Autowired
    private RoomService roomService;

    @Autowired
    private TheaterRepository theaterRepository;

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SeatRepository seatRepository;

    @Autowired
    private com.nhom_5.server.service.ShowtimeService showtimeService;

    @Autowired
    private com.nhom_5.server.repository.MovieRepository movieRepository;

    @Autowired
    private com.nhom_5.server.repository.ShowtimeRepository showtimeRepository;

    @Autowired
    private com.nhom_5.server.repository.ShowtimeSeatRepository showtimeSeatRepository;

    @Test
    void testCreateAndDeleteRoomSuccessfully() {
        Theater theater = theaterRepository.save(Theater.builder()
                .name("CGV Test")
                .address("123 Street")
                .phone("0123456789")
                .build());

        RoomRequest request = new RoomRequest();
        request.setTheaterId(theater.getId());
        request.setName("Phòng Test Integration");

        RoomResponse created = roomService.create(request);
        UUID roomId = created.getId();

        assertTrue(roomRepository.existsById(roomId));
        assertTrue(seatRepository.existsByRoomId(roomId));

        // Thực hiện xóa phòng
        roomService.delete(roomId);

        assertFalse(roomRepository.existsById(roomId));
        assertFalse(seatRepository.existsByRoomId(roomId));
    }

    @Test
    void testDeleteRoomWithShowtimesCascadeSuccessfully() {
        Theater theater = theaterRepository.save(Theater.builder()
                .name("CGV Test 2")
                .address("456 Street")
                .phone("0987654321")
                .build());

        var movie = movieRepository.save(com.nhom_5.server.entity.Movie.builder()
                .title("Movie Test")
                .description("Description")
                .duration(120)
                .releaseDate(java.time.LocalDate.now())
                .status(com.nhom_5.server.entity.enums.MovieStatus.NOW_SHOWING)
                .build());

        RoomRequest request = new RoomRequest();
        request.setTheaterId(theater.getId());
        request.setName("Phòng Test Cascade Showtime");

        RoomResponse created = roomService.create(request);
        UUID roomId = created.getId();

        // Tạo suất chiếu cho phòng này
        var showtimeRequest = new com.nhom_5.server.dto.request.ShowtimeRequest();
        showtimeRequest.setMovieId(movie.getId());
        showtimeRequest.setRoomId(roomId);
        showtimeRequest.setStartTime(java.time.Instant.now().plus(java.time.Duration.ofDays(2)));
        showtimeRequest.setStatus(com.nhom_5.server.entity.enums.ShowtimeStatus.OPEN);

        var showtime = showtimeService.create(showtimeRequest);
        UUID showtimeId = showtime.getId();

        assertTrue(showtimeRepository.existsById(showtimeId));
        assertTrue(showtimeSeatRepository.existsByShowtimeId(showtimeId));

        // Thực hiện xóa phòng
        roomService.delete(roomId);

        assertFalse(roomRepository.existsById(roomId));
        assertFalse(seatRepository.existsByRoomId(roomId));
        assertFalse(showtimeRepository.existsById(showtimeId));
        assertFalse(showtimeSeatRepository.existsByShowtimeId(showtimeId));
    }
}
