package com.nhom_5.server.service;

import org.springframework.stereotype.Service;

import com.nhom_5.server.repository.ShowtimeSeatRepository;
import com.nhom_5.server.entity.ShowtimeSeat;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import java.util.List;
import java.util.UUID;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import com.nhom_5.server.dto.response.ShowtimeSeatResponse;
import com.nhom_5.server.entity.User;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;

@Service
@RequiredArgsConstructor
public class ShowtimeSeatService {
    private final ShowtimeSeatRepository showtimeSeatRepository;

    @Transactional(readOnly = true)
    public List<ShowtimeSeatResponse> getSeats(UUID showtimeId) {
        return showtimeSeatRepository.findByShowtimeId(showtimeId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void holdSeats(UUID showtimeId, List<UUID> seatIds, User user) {
        List<ShowtimeSeat> seats = showtimeSeatRepository.findByShowtimeIdAndIdsForUpdate(showtimeId, seatIds);

        if (seats.size() != seatIds.size()) {
            throw new IllegalArgumentException("Một hoặc nhiều ghế không hợp lệ cho suất chiếu này");
        }

        Instant now = Instant.now();
        Instant holdExpiration = now.plus(5, ChronoUnit.MINUTES);

        for (ShowtimeSeat seat : seats) {
            if (seat.getStatus() == ShowtimeSeatStatus.SOLD) {
                throw new IllegalStateException("Ghế " + seat.getSeat().getSeatRow() + seat.getSeat().getSeatNumber() + " đã được bán");
            }
            if (seat.getStatus() == ShowtimeSeatStatus.HELD) {
                if (seat.getHeldUntil() != null && seat.getHeldUntil().isAfter(now)) {
                    if (seat.getHeldBy() != null && !seat.getHeldBy().getId().equals(user.getId())) {
                        throw new IllegalStateException("Ghế " + seat.getSeat().getSeatRow() + seat.getSeat().getSeatNumber() + " đang được người khác giữ");
                    }
                }
            }
            
            seat.setStatus(ShowtimeSeatStatus.HELD);
            seat.setHeldBy(user);
            seat.setHeldUntil(holdExpiration);
        }

        showtimeSeatRepository.saveAll(seats);
    }

    private ShowtimeSeatResponse toResponse(ShowtimeSeat seat) {
        return new ShowtimeSeatResponse(
                seat.getId(),
                seat.getSeat().getSeatRow(),
                seat.getSeat().getSeatNumber(),
                seat.getSeat().getSeatType().name(),
                seat.getPrice(),
                seat.getStatus(),
                seat.getHeldUntil());
    }

}
