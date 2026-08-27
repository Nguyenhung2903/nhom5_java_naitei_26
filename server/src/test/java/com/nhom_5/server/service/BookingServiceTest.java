package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.CreateBookingRequest;
import com.nhom_5.server.dto.request.ComboItemRequest;
import com.nhom_5.server.entity.*;
import com.nhom_5.server.entity.enums.*;
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
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private UserRepository userRepository;
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

    @Test
    void createBooking_Success_EarnsPoints_WhenPaidWithVNPay() {
        UUID seatId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .status(ShowtimeStatus.OPEN)
                .startTime(Instant.now().plus(2, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(4, ChronoUnit.HOURS))
                .build();

        Seat seat = Seat.builder().seatRow("A").seatNumber(1).build();
        ShowtimeSeat showtimeSeat = ShowtimeSeat.builder()
                .id(seatId)
                .showtime(showtime)
                .seat(seat)
                .price(BigDecimal.valueOf(100000))
                .status(ShowtimeSeatStatus.AVAILABLE)
                .build();

        User managedUser = User.builder()
                .id(userId)
                .username("testuser")
                .points(0)
                .build();

        CreateBookingRequest request = CreateBookingRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seatId))
                .paymentMethod(PaymentMethod.VNPAY)
                .vnpayParams(Map.of("vnp_ResponseCode", "00"))
                .build();

        when(showtimeSeatRepository.findById(seatId)).thenReturn(Optional.of(showtimeSeat));
        when(userRepository.findById(userId)).thenReturn(Optional.of(managedUser));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.createBooking(request);

        // 100.000 VNĐ -> 10 điểm thưởng
        assertEquals(10, managedUser.getPoints());
        assertEquals(ShowtimeSeatStatus.BOOKED, showtimeSeat.getStatus());
        verify(bookingRepository).save(argThat(b -> 
            b.getBookingStatus() == BookingStatus.CONFIRMED &&
            b.getPaymentStatus() == PaymentStatus.PAID &&
            b.getPointsEarned() == 10 &&
            b.getPointsUsed() == 0 &&
            b.getTotalAmount().compareTo(BigDecimal.valueOf(100000)) == 0
        ));
    }

    @Test
    void createBooking_Success_DeductsPointsAndEarnsNewPoints_WhenPartiallyPaidWithPoints() {
        UUID seatId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .status(ShowtimeStatus.OPEN)
                .startTime(Instant.now().plus(2, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(4, ChronoUnit.HOURS))
                .build();

        Seat seat = Seat.builder().seatRow("B").seatNumber(5).build();
        ShowtimeSeat showtimeSeat = ShowtimeSeat.builder()
                .id(seatId)
                .showtime(showtime)
                .seat(seat)
                .price(BigDecimal.valueOf(100000))
                .status(ShowtimeSeatStatus.AVAILABLE)
                .build();

        // User có sẵn 50 điểm
        User managedUser = User.builder()
                .id(userId)
                .username("testuser")
                .points(50)
                .build();

        // Sử dụng 20 điểm (giảm 20.000 VNĐ) -> Còn lại 80.000 VNĐ -> Tích thêm 8 điểm
        CreateBookingRequest request = CreateBookingRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seatId))
                .pointsToUse(20)
                .paymentMethod(PaymentMethod.VNPAY)
                .vnpayParams(Map.of("vnp_ResponseCode", "00"))
                .build();

        when(showtimeSeatRepository.findById(seatId)).thenReturn(Optional.of(showtimeSeat));
        when(userRepository.findById(userId)).thenReturn(Optional.of(managedUser));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.createBooking(request);

        // Điểm mới = 50 - 20 (dùng) + 8 (tích lũy từ 80.000đ) = 38 điểm
        assertEquals(38, managedUser.getPoints());
        verify(bookingRepository).save(argThat(b ->
            b.getBookingStatus() == BookingStatus.CONFIRMED &&
            b.getPointsUsed() == 20 &&
            b.getPointsDiscountAmount().compareTo(BigDecimal.valueOf(20000)) == 0 &&
            b.getPointsEarned() == 8 &&
            b.getTotalAmount().compareTo(BigDecimal.valueOf(80000)) == 0
        ));
    }

    @Test
    void createBooking_ThrowsBadRequest_WhenRequestedPointsExceedUserBalance() {
        UUID seatId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .status(ShowtimeStatus.OPEN)
                .startTime(Instant.now().plus(2, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(4, ChronoUnit.HOURS))
                .build();

        ShowtimeSeat showtimeSeat = ShowtimeSeat.builder()
                .id(seatId)
                .showtime(showtime)
                .seat(Seat.builder().seatRow("C").seatNumber(1).build())
                .price(BigDecimal.valueOf(100000))
                .status(ShowtimeSeatStatus.AVAILABLE)
                .build();

        User managedUser = User.builder()
                .id(userId)
                .username("testuser")
                .points(10) // chỉ có 10 điểm
                .build();

        CreateBookingRequest request = CreateBookingRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seatId))
                .pointsToUse(50) // yêu cầu dùng 50 điểm > 10 điểm
                .paymentMethod(PaymentMethod.VNPAY)
                .build();

        when(showtimeSeatRepository.findById(seatId)).thenReturn(Optional.of(showtimeSeat));
        when(userRepository.findById(userId)).thenReturn(Optional.of(managedUser));

        AppException ex = assertThrows(AppException.class, () -> bookingService.createBooking(request));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("vượt quá số dư hiện có"));
    }

    @Test
    void createBooking_Success_WithZeroAmount_WhenFullyPaidByPoints() {
        UUID seatId = UUID.randomUUID();
        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .status(ShowtimeStatus.OPEN)
                .startTime(Instant.now().plus(2, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(4, ChronoUnit.HOURS))
                .build();

        ShowtimeSeat showtimeSeat = ShowtimeSeat.builder()
                .id(seatId)
                .showtime(showtime)
                .seat(Seat.builder().seatRow("D").seatNumber(2).build())
                .price(BigDecimal.valueOf(50000))
                .status(ShowtimeSeatStatus.AVAILABLE)
                .build();

        User managedUser = User.builder()
                .id(userId)
                .username("testuser")
                .points(100)
                .build();

        CreateBookingRequest request = CreateBookingRequest.builder()
                .showtimeId(showtime.getId())
                .seatIds(List.of(seatId))
                .pointsToUse(50) // Giảm 50.000 VNĐ -> Đơn 0đ
                .paymentMethod(PaymentMethod.POINTS)
                .build();

        when(showtimeSeatRepository.findById(seatId)).thenReturn(Optional.of(showtimeSeat));
        when(userRepository.findById(userId)).thenReturn(Optional.of(managedUser));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(ticketRepository.save(any(Ticket.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        bookingService.createBooking(request);

        // 100 - 50 = 50 điểm (0đ tích 0 điểm)
        assertEquals(50, managedUser.getPoints());
        verify(bookingRepository).save(argThat(b ->
            b.getBookingStatus() == BookingStatus.CONFIRMED &&
            b.getPaymentStatus() == PaymentStatus.PAID &&
            b.getPointsUsed() == 50 &&
            b.getPointsDiscountAmount().compareTo(BigDecimal.valueOf(50000)) == 0 &&
            b.getPointsEarned() == 0 &&
            b.getTotalAmount().compareTo(BigDecimal.ZERO) == 0
        ));
    }

    @Test
    void cancelBooking_Success_RefundsPointsUsedAndRollsBackPointsEarned() {
        UUID bookingId = UUID.randomUUID();

        Showtime showtime = Showtime.builder()
                .id(UUID.randomUUID())
                .startTime(Instant.now().plus(3, ChronoUnit.HOURS))
                .endTime(Instant.now().plus(5, ChronoUnit.HOURS))
                .build();

        ShowtimeSeat seat = ShowtimeSeat.builder()
                .id(UUID.randomUUID())
                .showtime(showtime)
                .status(ShowtimeSeatStatus.BOOKED)
                .build();

        Ticket ticket = Ticket.builder()
                .id(UUID.randomUUID())
                .showtimeSeat(seat)
                .price(BigDecimal.valueOf(100000))
                .build();

        // User đang có 38 điểm sau giao dịch (đã trừ 20 điểm dùng, đã cộng 8 điểm tích lũy)
        User bookingUser = User.builder()
                .id(userId)
                .username("testuser")
                .points(38)
                .build();

        Booking booking = Booking.builder()
                .id(bookingId)
                .user(bookingUser)
                .bookingCode("BK-REFUND-POINTS")
                .bookingStatus(BookingStatus.CONFIRMED)
                .paymentStatus(PaymentStatus.PAID)
                .pointsUsed(20)
                .pointsEarned(8)
                .tickets(new ArrayList<>(List.of(ticket)))
                .build();

        when(bookingRepository.findByIdWithDetails(bookingId)).thenReturn(Optional.of(booking));

        bookingService.cancelBooking(bookingId);

        // Hoàn lại: 38 + 20 (hoàn điểm đã dùng) - 8 (thu hồi điểm đã tích) = 50 điểm ban đầu
        assertEquals(50, bookingUser.getPoints());
        assertEquals(BookingStatus.CANCELLED, booking.getBookingStatus());
        assertEquals(ShowtimeSeatStatus.AVAILABLE, seat.getStatus());
    }
}
