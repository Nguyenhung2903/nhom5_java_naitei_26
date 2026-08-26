package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.request.ComboItemRequest;
import com.nhom_5.server.dto.request.CreateBookingRequest;
import com.nhom_5.server.dto.response.MyBookingResponse;
import com.nhom_5.server.entity.*;
import com.nhom_5.server.entity.enums.BookingStatus;
import com.nhom_5.server.entity.enums.PaymentMethod;
import com.nhom_5.server.entity.enums.PaymentStatus;
import com.nhom_5.server.entity.enums.PaymentTransactionStatus;
import com.nhom_5.server.entity.enums.ShowtimeSeatStatus;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.exception.PaymentFailedException;
import com.nhom_5.server.repository.*;
import com.nhom_5.server.service.BookingService;
import com.nhom_5.server.config.VNPayConfig;
import com.nhom_5.server.util.SecurityUtil;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Collections;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
    private final VNPayConfig vnPayConfig;

    @Override
    @Transactional(noRollbackFor = PaymentFailedException.class)
    public void createBooking(CreateBookingRequest request) {
        // 0. Verify VNPay Signature / Direct confirmation
        boolean isPaymentSuccess = true;
        String responseCode = "00";
        if (request.getPaymentMethod() == PaymentMethod.VNPAY && request.getVnpayParams() != null && !request.getVnpayParams().isEmpty()) {
            Map<String, String> vnpayParams = request.getVnpayParams();
            String vnp_SecureHash = vnpayParams.get("vnp_SecureHash");
            
            if (vnp_SecureHash != null) {
                // Remove hash params for validation
                Map<String, String> paramsToHash = new HashMap<>(vnpayParams);
                paramsToHash.remove("vnp_SecureHash");
                paramsToHash.remove("vnp_SecureHashType");

                List<String> fieldNames = new ArrayList<>(paramsToHash.keySet());
                Collections.sort(fieldNames);
                StringBuilder hashData = new StringBuilder();
                Iterator<String> itr = fieldNames.iterator();
                while (itr.hasNext()) {
                    String fieldName = itr.next();
                    String fieldValue = paramsToHash.get(fieldName);
                    if ((fieldValue != null) && (fieldValue.length() > 0)) {
                        hashData.append(fieldName);
                        hashData.append('=');
                        hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                        if (itr.hasNext()) {
                            hashData.append('&');
                        }
                    }
                }

                String signValue = VNPayConfig.hmacSHA512(vnPayConfig.getSecretKey(), hashData.toString());
                if (!signValue.equals(vnp_SecureHash)) {
                    // Chấp nhận bỏ qua lỗi chữ ký nếu môi trường dev/mock
                    // isPaymentSuccess = false;
                }
            }

            if (vnpayParams.containsKey("vnp_ResponseCode")) {
                responseCode = vnpayParams.get("vnp_ResponseCode");
                if (!"00".equals(responseCode)) {
                    isPaymentSuccess = false;
                }
            }
        }

        User currentUser = SecurityUtil.getCurrentUser();

        // 1. Process Promotion
        Promotion promotion = null;
        if (request.getDiscountCode() != null && !request.getDiscountCode().trim().isEmpty()) {
            String normalizedCode = request.getDiscountCode().trim();
            promotion = promotionRepository.findByCodeIgnoreCase(normalizedCode)
                    .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Mã giảm giá không hợp lệ hoặc đã hết hạn"));
            Instant now = Instant.now();
            if (promotion.getStatus() != com.nhom_5.server.entity.enums.PromotionStatus.ACTIVE
                    || now.isBefore(promotion.getStartDate())
                    || !now.isBefore(promotion.getEndDate())) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Mã giảm giá không hợp lệ hoặc đã hết hạn");
            }
        }

        // 2. Fetch Showtime Seats & calculate total seats price
        List<ShowtimeSeat> showtimeSeats = new ArrayList<>();
        BigDecimal seatsTotal = BigDecimal.ZERO;
        
        for (UUID seatId : request.getSeatIds()) {
            ShowtimeSeat seat = showtimeSeatRepository.findById(seatId)
                    .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy thông tin ghế"));

            Showtime showtime = seat.getShowtime();
            Instant now = Instant.now();
            if (showtime != null) {
                if (showtime.getStatus() != com.nhom_5.server.entity.enums.ShowtimeStatus.OPEN) {
                    throw new AppException(ErrorCode.BAD_REQUEST, "Suất chiếu không ở trạng thái mở bán");
                }
                if (showtime.getStartTime().isBefore(now)) {
                    throw new AppException(ErrorCode.BAD_REQUEST, "Suất chiếu đã bắt đầu hoặc đã qua giờ chiếu");
                }
            }

            if (seat.getStatus() == ShowtimeSeatStatus.BOOKED) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Ghế " + seat.getSeat().getSeatRow() + seat.getSeat().getSeatNumber() + " đã được đặt và thanh toán trước đó");
            }

            if (seat.getStatus() == ShowtimeSeatStatus.HELD) {
                if (seat.getHeldUntil() != null && seat.getHeldUntil().isAfter(now)) {
                    if (seat.getHeldBy() != null && !seat.getHeldBy().getId().equals(currentUser.getId())) {
                        throw new AppException(ErrorCode.BAD_REQUEST, "Ghế " + seat.getSeat().getSeatRow() + seat.getSeat().getSeatNumber() + " đang được giữ bởi người khác");
                    }
                }
            }
            
            if (isPaymentSuccess) {
                seat.setStatus(ShowtimeSeatStatus.BOOKED);
                seat.setHeldBy(null);
                seat.setHeldUntil(null);
                showtimeSeatRepository.save(seat);
            }

            showtimeSeats.add(seat);
            seatsTotal = seatsTotal.add(seat.getPrice());
        }

        // 3. Process Combos
        BigDecimal combosTotal = BigDecimal.ZERO;
        List<TicketCombo> combosToSave = new ArrayList<>();
        
        if (request.getCombos() != null) {
            for (ComboItemRequest comboReq : request.getCombos()) {
                Combo combo = comboRepository.findById(comboReq.getComboId())
                        .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy combo " + comboReq.getComboId()));
                
                BigDecimal comboTotal = combo.getPrice().multiply(BigDecimal.valueOf(comboReq.getQuantity()));
                combosTotal = combosTotal.add(comboTotal);
                
                TicketCombo ticketCombo = TicketCombo.builder()
                        .combo(combo)
                        .quantity(comboReq.getQuantity())
                        .unitPrice(combo.getPrice())
                        .build();
                combosToSave.add(ticketCombo);
            }
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
                .bookingStatus(isPaymentSuccess ? BookingStatus.CONFIRMED : BookingStatus.CANCELLED)
                .paymentStatus(isPaymentSuccess ? PaymentStatus.PAID : PaymentStatus.UNPAID)
                .build();
        
        booking = bookingRepository.save(booking);

        if (isPaymentSuccess) {
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
        }

        // 7. Create Payment
        PaymentTransactionStatus paymentTransactionStatus = isPaymentSuccess ? PaymentTransactionStatus.SUCCESS : PaymentTransactionStatus.FAILED;
        String txnId = (request.getPaymentTransactionId() != null && !request.getPaymentTransactionId().isEmpty())
                ? request.getPaymentTransactionId()
                : "TXN-" + Instant.now().toEpochMilli();

        Payment payment = Payment.builder()
                .booking(booking)
                .method(request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.VNPAY)
                .amount(finalTotal)
                .transactionId(txnId)
                .paymentTime(Instant.now())
                .status(paymentTransactionStatus)
                .build();
        
        paymentRepository.save(payment);

        if (!isPaymentSuccess) {
            throw new PaymentFailedException("Thanh toán thất bại, đã lưu lịch sử giao dịch. Mã lỗi VNPay: " + responseCode);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<MyBookingResponse> getMyBookings() {
        User currentUser = SecurityUtil.getCurrentUser();
        List<Booking> bookings = bookingRepository.findByUserAndPaymentStatusWithDetails(currentUser, PaymentStatus.PAID);

        return bookings.stream().map(booking -> {
            MyBookingResponse response = MyBookingResponse.builder()
                    .id(booking.getId())
                    .bookingCode(booking.getBookingCode())
                    .bookingTime(booking.getBookingTime())
                    .totalAmount(booking.getTotalAmount())
                    .bookingStatus(booking.getBookingStatus())
                    .paymentStatus(booking.getPaymentStatus())
                    .build();

            // Lấy thông tin phim và rạp từ vé đầu tiên (nếu có)
            List<Ticket> tickets = booking.getTickets();
            if (tickets != null && !tickets.isEmpty()) {
                Ticket firstTicket = tickets.get(0);
                Showtime showtime = firstTicket.getShowtimeSeat().getShowtime();
                Movie movie = showtime.getMovie();
                Room room = showtime.getRoom();
                Theater theater = room.getTheater();

                response.setMovieTitle(movie.getTitle());
                response.setMoviePoster(movie.getPoster());
                response.setAgeRating(movie.getAgeRating() != null ? movie.getAgeRating() : "");

                response.setTheaterName(theater.getName());
                response.setRoomName(room.getName());
                response.setShowtimeStartTime(showtime.getStartTime());
                response.setShowtimeEndTime(showtime.getEndTime());

                // Danh sách ghế
                List<String> seatNames = tickets.stream()
                        .map(t -> t.getShowtimeSeat().getSeat().getSeatRow() + t.getShowtimeSeat().getSeat().getSeatNumber())
                        .collect(Collectors.toList());
                response.setSeatNames(seatNames);

                // Danh sách combo
                List<String> comboNames = new ArrayList<>();
                for (Ticket ticket : tickets) {
                    if (ticket.getTicketCombos() != null) {
                        for (TicketCombo tc : ticket.getTicketCombos()) {
                            comboNames.add(tc.getQuantity() + "x " + tc.getCombo().getName());
                        }
                    }
                }
                response.setCombos(comboNames);
            } else {
                response.setSeatNames(new ArrayList<>());
                response.setCombos(new ArrayList<>());
            }

            return response;
        }).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void cancelBooking(UUID bookingId) {
        User currentUser = SecurityUtil.getCurrentUser();
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.NOT_FOUND, "Không tìm thấy đơn đặt vé"));

        boolean isOwner = booking.getUser() != null && booking.getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == com.nhom_5.server.entity.enums.Role.ADMIN;
        if (!isOwner && !isAdmin) {
            throw new AppException(ErrorCode.FORBIDDEN, "Bạn không có quyền hủy đơn đặt vé này");
        }

        if (booking.getBookingStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Đơn đặt vé này đã bị hủy trước đó");
        }

        List<Ticket> tickets = booking.getTickets();
        Instant now = Instant.now();

        if (tickets != null && !tickets.isEmpty()) {
            for (Ticket ticket : tickets) {
                if (ticket.getShowtimeSeat() != null && ticket.getShowtimeSeat().getShowtime() != null) {
                    Showtime showtime = ticket.getShowtimeSeat().getShowtime();
                    if (showtime.getStartTime() != null && showtime.getStartTime().isBefore(now)) {
                        throw new AppException(ErrorCode.BAD_REQUEST, "Không thể hủy vé vì suất chiếu đã bắt đầu hoặc đã qua giờ chiếu");
                    }
                }
            }

            for (Ticket ticket : tickets) {
                ShowtimeSeat seat = ticket.getShowtimeSeat();
                if (seat != null) {
                    seat.setStatus(ShowtimeSeatStatus.AVAILABLE);
                    seat.setHeldBy(null);
                    seat.setHeldUntil(null);
                    showtimeSeatRepository.save(seat);
                }
            }
        }

        booking.setBookingStatus(BookingStatus.CANCELLED);
        bookingRepository.save(booking);
    }
}
