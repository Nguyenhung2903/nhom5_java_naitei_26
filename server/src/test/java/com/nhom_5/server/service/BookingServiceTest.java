package com.nhom_5.server.service;

import com.nhom_5.server.entity.*;
import com.nhom_5.server.entity.enums.BookingStatus;
import com.nhom_5.server.entity.enums.PaymentStatus;
import com.nhom_5.server.entity.enums.Role;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.*;
import com.nhom_5.server.security.CustomUserDetails;
import com.nhom_5.server.service.impl.BookingServiceImpl;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private ShowtimeSeatRepository showtimeSeatRepository;
    @Mock
    private ComboRepository comboRepository;
    @Mock
    private PromotionRepository promotionRepository;
    @Mock
    private TicketRepository ticketRepository;
    @Mock
    private TicketComboRepository ticketComboRepository;
    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User currentUser;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        currentUser = User.builder()
                .id(userId)
                .username("testuser")
                .email("test@example.com")
                .role(Role.USER)
                .build();

        CustomUserDetails userDetails = new CustomUserDetails(currentUser);
        UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void cancelBooking_Success_WhenShowtimeIsInFuture() {
        UUID bookingId = UUID.randomUUID();

        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .startTime(Instant.now().plus(2, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(4, ChronoUnit.HOURS))
                .build();

        ShowtimeSeat seat1 = ShowtimeSeat.builder()
                .id(UUID.randomUUID())
                .showtime(showtime)
                .status(ShowtimeSeatStatus.BOOKED)
                .build();

        Ticket ticket1 = Ticket.builder()
                .id(UUID.randomUUID())
                .showtimeSeat(seat1)
                .price(BigDecimal.valueOf(90000))
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(currentUser)
                .bookingCode("BK-123456")
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .tickets(new ArrayList<>(List.of(ticket1)))
                .build();

        when(bookingRepository.findByIdWithDetails(bookingId)).thenReturn(Optional.of(booking));

        bookingService.cancelBooking(bookingId);

        assertEquals(BookingStatus.CANCELLED, booking.getBookingStatus());
        assertEquals(PaymentStatus.PAID, booking.getPaymentStatus());
        assertEquals(ShowtimeSeatStatus.AVAILABLE, seat1.getStatus());
        assertNull(seat1.getHeldBy());
        assertNull(seat1.getHeldUntil());

        verify(showtimeSeatRepository, times(1)).save(seat1);
        verify(bookingRepository, times(1)).save(booking);
    }

    @Test
    void cancelBooking_ThrowsNotFound_WhenBookingDoesNotExist() {
        UUID bookingId = UUID.randomUUID();
        when(bookingRepository.findByIdWithDetails(bookingId)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () -> bookingService.cancelBooking(bookingId));
        assertEquals(ErrorCode.NOT_FOUND, ex.getErrorCode());
    }

    @Test
    void cancelBooking_ThrowsForbidden_WhenUserIsNotOwnerNorAdmin() {
        UUID bookingId = UUID.randomUUID();
        User anotherUser = User.builder()
                .id(UUID.randomUUID())
                .username("another")
                .role(Role.USER)
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(anotherUser)
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .build();

        when(bookingRepository.findByIdWithDetails(bookingId)).thenReturn(Optional.of(booking));

        AppException ex = assertThrows(AppException.class, () -> bookingService.cancelBooking(bookingId));
        assertEquals(ErrorCode.FORBIDDEN, ex.getErrorCode());
    }

    @Test
    void cancelBooking_ThrowsBadRequest_WhenAlreadyCancelled() {
        UUID bookingId = UUID.randomUUID();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(currentUser)
                .bookingStatus(BookingStatus.CANCELLED)
                .paymentStatus(PaymentStatus.PAID)
                .build();

        when(bookingRepository.findByIdWithDetails(bookingId)).thenReturn(Optional.of(booking));

        AppException ex = assertThrows(AppException.class, () -> bookingService.cancelBooking(bookingId));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Đơn đặt vé này đã bị hủy trước đó", ex.getMessage());
    }

    @Test
    void cancelBooking_ThrowsBadRequest_WhenShowtimeHasAlreadyStarted() {
        UUID bookingId = UUID.randomUUID();

        Showtime pastShowtime = Showtime.builder()
                .id(UUID.randomUUID())
                .startTime(Instant.now().minus(30, ChronoUnit.MINUTES))
                .endTime(Instant.now().plus(1, ChronoUnit.HOURS))
                .build();

        ShowtimeSeat seat = ShowtimeSeat.builder()
                .id(UUID.randomUUID())
                .showtime(pastShowtime)
                .status(ShowtimeSeatStatus.BOOKED)
                .build();

        Ticket ticket = Ticket.builder()
                .id(UUID.randomUUID())
                .showtimeSeat(seat)
                .price(BigDecimal.valueOf(90000))
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(currentUser)
                .bookingCode("BK-PAST")
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .tickets(new ArrayList<>(List.of(ticket)))
                .build();

        when(bookingRepository.findByIdWithDetails(bookingId)).thenReturn(Optional.of(booking));

        AppException ex = assertThrows(AppException.class, () -> bookingService.cancelBooking(bookingId));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("suất chiếu đã bắt đầu"));
    }
}
