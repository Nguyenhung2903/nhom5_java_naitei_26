package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.ComboItemRequest;
import com.nhom_5.server.dto.request.CreateBookingRequest;
import com.nhom_5.server.entity.*;
import com.nhom_5.server.entity.enums.BookingStatus;
import com.nhom_5.server.entity.enums.PaymentStatus;
import com.nhom_5.server.entity.enums.PaymentTransactionStatus;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.*;
import com.nhom_5.server.service.BookingService;
import com.nhom_5.server.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final ShowtimeSeatRepository showtimeSeatRepository;
    private final ComboRepository comboRepository;
    private final PromotionRepository promotionRepository;
    private final TicketRepository ticketRepository;
    private final TicketComboRepository ticketComboRepository;
    private final PaymentRepository paymentRepository;

    @Override
    @Transactional
    public void createBooking(CreateBookingRequest request) {
        User currentUser = SecurityUtil.getCurrentUser();

        // 1. Process Promotion
        Promotion promotion = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().isEmpty()) {
            promotion = promotionRepository.findByCode(request.getDiscountCode())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
        }

        // 2. Fetch Showtime Seats & calculate total seats price
        List<ShowtimeSeat> showtimeSeats = new ArrayList<>();
        BigDecimal seatsTotal = BigDecimal.ZERO;
        
        for (UUID seatId : request.getSeatIds()) {
            ShowtimeSeat seat = showtimeSeatRepository.findById(seatId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            
            if (seat.getStatus() == ShowtimeSeatStatus.BOOKED) {
                throw new AppException(ErrorCode.BAD_REQUEST);
            }

            seat.setStatus(ShowtimeSeatStatus.BOOKED);
            showtimeSeatRepository.save(seat);

            showtimeSeats.add(seat);
            seatsTotal = seatsTotal.add(seat.getPrice());
        }

        // 3. Process Combos
        BigDecimal combosTotal = BigDecimal.ZERO;
        List<TicketCombo> combosToSave = new ArrayList<>();
        
        for (ComboItemRequest comboReq : request.getCombos()) {
            Combo combo = comboRepository.findById(comboReq.getComboId())
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND));
            
            BigDecimal comboTotal = combo.getPrice().multiply(BigDecimal.valueOf(comboReq.getQuantity()));
            combosTotal = combosTotal.add(comboTotal);
            
            TicketCombo ticketCombo = TicketCombo.builder()
                    .combo(combo)
                    .quantity(comboReq.getQuantity())
                    .unitPrice(combo.getPrice())
                    .build();
            combosToSave.add(ticketCombo);
        }

        // 4. Calculate Final Amount
        BigDecimal subTotal = seatsTotal.add(combosTotal);
        BigDecimal discountAmount = BigDecimal.ZERO;
        
        if (promotion != null) {
            switch (promotion.getDiscountType()) {
                case PERCENT:
                    discountAmount = subTotal.multiply(promotion.getDiscountValue()).divide(BigDecimal.valueOf(100));
                    break;
                case FIXED:
                    discountAmount = promotion.getDiscountValue();
                    break;
            }
        }
        
        BigDecimal finalTotal = subTotal.subtract(discountAmount);
        if (finalTotal.compareTo(BigDecimal.ZERO) < 0) {
            finalTotal = BigDecimal.ZERO;
        }

        // Generate Booking Code (e.g., BK-TIMESTAMP-UUID)
        String bookingCode = "BK-" + Instant.now().toEpochMilli() + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase();

        // 5. Create Booking
        Booking booking = Booking.builder()
                .user(currentUser)
                .promotion(promotion)
                .bookingCode(bookingCode)
                .totalAmount(finalTotal)
                .bookingStatus(BookingStatus.CONFIRMED)
                .build();
        
        booking = bookingRepository.save(booking);

        // 6. Create Tickets and attach Combos to the first ticket
        boolean isFirstTicket = true;
        for (ShowtimeSeat seat : showtimeSeats) {
            Ticket ticket = Ticket.builder()
                    .booking(booking)
                    .showtimeSeat(seat)
                    .price(seat.getPrice())
                    .build();
            ticket = ticketRepository.save(ticket);
            
            if (isFirstTicket && !combosToSave.isEmpty()) {
                for (TicketCombo tc : combosToSave) {
                    tc.setTicket(ticket);
                    ticketComboRepository.save(tc);
                }
                isFirstTicket = false;
            }
        }

        // 7. Create Payment
        PaymentTransactionStatus paymentTransactionStatus = PaymentTransactionStatus.PENDING;
        PaymentStatus bookingPaymentStatus = PaymentStatus.UNPAID;

        if (request.getPaymentMethod() == com.nhom_5.server.entity.enums.PaymentMethod.PAYPAL) {
            paymentTransactionStatus = PaymentTransactionStatus.SUCCESS;
            bookingPaymentStatus = PaymentStatus.PAID;
        }

        // Cập nhật bookingPaymentStatus
        booking.setPaymentStatus(bookingPaymentStatus);
        bookingRepository.save(booking);

        Payment payment = Payment.builder()
                .booking(booking)
                .method(request.getPaymentMethod())
                .amount(finalTotal)
                .transactionId(request.getPaymentTransactionId())
                .paymentTime(Instant.now())
                .status(paymentTransactionStatus)
                .build();
        
        paymentRepository.save(payment);
    }
}
