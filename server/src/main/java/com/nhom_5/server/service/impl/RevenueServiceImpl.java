package com.nhom_5.server.service.impl;

import com.nhom_5.server.dto.response.revenue.*;
import com.nhom_5.server.entity.*;
import com.nhom_5.server.entity.enums.PaymentStatus;
import com.nhom_5.server.repository.BookingRepository;
import com.nhom_5.server.repository.PaymentRepository;
import com.nhom_5.server.service.RevenueService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RevenueServiceImpl implements RevenueService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    private static final ZoneId VN_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy");

    @Override
    public RevenueOverviewResponse getOverview(Instant startDate, Instant endDate, UUID movieId, UUID theaterId) {
        List<Booking> allPaidBookings = getFilteredBookings(startDate, endDate, movieId, theaterId);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal ticketRevenue = BigDecimal.ZERO;
        BigDecimal comboRevenue = BigDecimal.ZERO;
        long totalTicketsSold = 0;
        long totalBookings = allPaidBookings.size();

        for (Booking booking : allPaidBookings) {
            totalRevenue = totalRevenue.add(booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO);
            
            if (booking.getTickets() != null) {
                for (Ticket ticket : booking.getTickets()) {
                    if (isTicketMatching(ticket, movieId, theaterId)) {
                        totalTicketsSold++;
                        if (ticket.getPrice() != null) {
                            ticketRevenue = ticketRevenue.add(ticket.getPrice());
                        }
                        if (ticket.getTicketCombos() != null) {
                            for (TicketCombo tc : ticket.getTicketCombos()) {
                                BigDecimal comboCost = getComboPrice(tc);
                                comboRevenue = comboRevenue.add(comboCost);
                            }
                        }
                    }
                }
            }
        }

        BigDecimal averageOrderValue = totalBookings > 0
                ? totalRevenue.divide(BigDecimal.valueOf(totalBookings), 0, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        Double growthRate = calculateGrowthRate(startDate, endDate, movieId, theaterId, totalRevenue);

        return RevenueOverviewResponse.builder()
                .totalRevenue(totalRevenue)
                .ticketRevenue(ticketRevenue)
                .comboRevenue(comboRevenue)
                .totalTicketsSold(totalTicketsSold)
                .totalBookings(totalBookings)
                .averageOrderValue(averageOrderValue)
                .growthRate(growthRate)
                .build();
    }

    @Override
    public List<RevenueTimePointResponse> getTimeSeriesRevenue(Instant startDate, Instant endDate, String groupBy, UUID movieId, UUID theaterId) {
        List<Booking> bookings = getFilteredBookings(startDate, endDate, movieId, theaterId);
        boolean isMonthGroup = "month".equalsIgnoreCase(groupBy);

        Map<String, List<Booking>> grouped = new TreeMap<>();

        for (Booking booking : bookings) {
            ZonedDateTime zdt = booking.getBookingTime().atZone(VN_ZONE);
            String key = isMonthGroup ? zdt.format(MONTH_FORMATTER) : zdt.format(DATE_FORMATTER);
            grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(booking);
        }

        List<RevenueTimePointResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<Booking>> entry : grouped.entrySet()) {
            String label = entry.getKey();
            List<Booking> bList = entry.getValue();

            BigDecimal timeTotalRevenue = BigDecimal.ZERO;
            BigDecimal timeTicketRevenue = BigDecimal.ZERO;
            BigDecimal timeComboRevenue = BigDecimal.ZERO;
            long timeTicketCount = 0;

            for (Booking b : bList) {
                timeTotalRevenue = timeTotalRevenue.add(b.getTotalAmount() != null ? b.getTotalAmount() : BigDecimal.ZERO);
                if (b.getTickets() != null) {
                    for (Ticket t : b.getTickets()) {
                        if (isTicketMatching(t, movieId, theaterId)) {
                            timeTicketCount++;
                            if (t.getPrice() != null) {
                                timeTicketRevenue = timeTicketRevenue.add(t.getPrice());
                            }
                            if (t.getTicketCombos() != null) {
                                for (TicketCombo tc : t.getTicketCombos()) {
                                    BigDecimal comboCost = getComboPrice(tc);
                                    timeComboRevenue = timeComboRevenue.add(comboCost);
                                }
                            }
                        }
                    }
                }
            }

            result.add(RevenueTimePointResponse.builder()
                    .dateLabel(label)
                    .totalRevenue(timeTotalRevenue)
                    .ticketRevenue(timeTicketRevenue)
                    .comboRevenue(timeComboRevenue)
                    .ticketCount(timeTicketCount)
                    .bookingCount((long) bList.size())
                    .build());
        }

        return result;
    }

    @Override
    public List<MovieRevenueResponse> getRevenueByMovies(Instant startDate, Instant endDate, UUID theaterId, Integer limit) {
        List<Booking> bookings = getFilteredBookings(startDate, endDate, null, theaterId);

        Map<UUID, MovieStatHolder> movieStats = new HashMap<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Booking booking : bookings) {
            if (booking.getTickets() == null) continue;
            for (Ticket ticket : booking.getTickets()) {
                if (theaterId != null && !isTicketInTheater(ticket, theaterId)) {
                    continue;
                }
                Movie movie = getMovieFromTicket(ticket);
                if (movie == null) continue;

                MovieStatHolder holder = movieStats.computeIfAbsent(movie.getId(), k -> new MovieStatHolder(movie));
                holder.ticketsSold++;

                BigDecimal ticketPrice = ticket.getPrice() != null ? ticket.getPrice() : BigDecimal.ZERO;
                holder.ticketRevenue = holder.ticketRevenue.add(ticketPrice);
                holder.totalRevenue = holder.totalRevenue.add(ticketPrice);
                grandTotal = grandTotal.add(ticketPrice);

                if (ticket.getTicketCombos() != null) {
                    for (TicketCombo tc : ticket.getTicketCombos()) {
                        BigDecimal comboCost = getComboPrice(tc);
                        holder.comboRevenue = holder.comboRevenue.add(comboCost);
                        holder.totalRevenue = holder.totalRevenue.add(comboCost);
                        grandTotal = grandTotal.add(comboCost);
                    }
                }
            }
        }

        final BigDecimal finalGrandTotal = grandTotal;
        List<MovieRevenueResponse> result = movieStats.values().stream()
                .map(holder -> {
                    double percentage = 0.0;
                    if (finalGrandTotal.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = holder.totalRevenue.multiply(BigDecimal.valueOf(100))
                                .divide(finalGrandTotal, 2, RoundingMode.HALF_UP)
                                .doubleValue();
                    }
                    String genreNames = "";
                    if (holder.movie.getGenres() != null && !holder.movie.getGenres().isEmpty()) {
                        genreNames = holder.movie.getGenres().stream()
                                .map(Genre::getName)
                                .filter(Objects::nonNull)
                                .collect(Collectors.joining(", "));
                    }
                    return MovieRevenueResponse.builder()
                            .movieId(holder.movie.getId())
                            .title(holder.movie.getTitle())
                            .posterUrl(holder.movie.getPoster())
                            .genre(genreNames)
                            .releaseDate(holder.movie.getReleaseDate())
                            .ticketsSold(holder.ticketsSold)
                            .ticketRevenue(holder.ticketRevenue)
                            .comboRevenue(holder.comboRevenue)
                            .totalRevenue(holder.totalRevenue)
                            .percentage(percentage)
                            .build();
                })
                .sorted((MovieRevenueResponse a, MovieRevenueResponse b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .collect(Collectors.toList());

        if (limit != null && limit > 0 && result.size() > limit) {
            return result.subList(0, limit);
        }
        return result;
    }

    @Override
    public List<TheaterRevenueResponse> getRevenueByTheaters(Instant startDate, Instant endDate, UUID movieId) {
        List<Booking> bookings = getFilteredBookings(startDate, endDate, movieId, null);

        Map<UUID, TheaterStatHolder> theaterStats = new HashMap<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Booking booking : bookings) {
            if (booking.getTickets() == null) continue;
            for (Ticket ticket : booking.getTickets()) {
                if (movieId != null && !isTicketForMovie(ticket, movieId)) {
                    continue;
                }
                Theater theater = getTheaterFromTicket(ticket);
                if (theater == null) continue;

                TheaterStatHolder holder = theaterStats.computeIfAbsent(theater.getId(), k -> new TheaterStatHolder(theater));
                holder.ticketsSold++;

                BigDecimal ticketPrice = ticket.getPrice() != null ? ticket.getPrice() : BigDecimal.ZERO;
                holder.ticketRevenue = holder.ticketRevenue.add(ticketPrice);
                holder.totalRevenue = holder.totalRevenue.add(ticketPrice);
                grandTotal = grandTotal.add(ticketPrice);

                if (ticket.getTicketCombos() != null) {
                    for (TicketCombo tc : ticket.getTicketCombos()) {
                        BigDecimal comboCost = getComboPrice(tc);
                        holder.comboRevenue = holder.comboRevenue.add(comboCost);
                        holder.totalRevenue = holder.totalRevenue.add(comboCost);
                        grandTotal = grandTotal.add(comboCost);
                    }
                }
            }
        }

        final BigDecimal finalGrandTotal = grandTotal;
        return theaterStats.values().stream()
                .map(holder -> {
                    double percentage = 0.0;
                    if (finalGrandTotal.compareTo(BigDecimal.ZERO) > 0) {
                        percentage = holder.totalRevenue.multiply(BigDecimal.valueOf(100))
                                .divide(finalGrandTotal, 2, RoundingMode.HALF_UP)
                                .doubleValue();
                    }
                    int roomCount = holder.theater.getRooms() != null ? holder.theater.getRooms().size() : 0;
                    return TheaterRevenueResponse.builder()
                            .theaterId(holder.theater.getId())
                            .theaterName(holder.theater.getName())
                            .address(holder.theater.getAddress())
                            .city(holder.theater.getAddress())
                            .totalRooms(roomCount)
                            .ticketsSold(holder.ticketsSold)
                            .ticketRevenue(holder.ticketRevenue)
                            .comboRevenue(holder.comboRevenue)
                            .totalRevenue(holder.totalRevenue)
                            .percentage(percentage)
                            .build();
                })
                .sorted((TheaterRevenueResponse a, TheaterRevenueResponse b) -> b.getTotalRevenue().compareTo(a.getTotalRevenue()))
                .collect(Collectors.toList());
    }

    @Override
    public List<AdminBookingDetailResponse> getAdminBookings(Instant startDate, Instant endDate, UUID movieId, UUID theaterId, String search, String status) {
        List<Booking> bookings = getFilteredBookings(startDate, endDate, movieId, theaterId);

        List<AdminBookingDetailResponse> result = new ArrayList<>();

        for (Booking b : bookings) {
            if (search != null && !search.trim().isEmpty()) {
                String q = search.trim().toLowerCase();
                boolean matchesCode = b.getBookingCode() != null && b.getBookingCode().toLowerCase().contains(q);
                boolean matchesUser = b.getUser() != null && (
                        (b.getUser().getFullName() != null && b.getUser().getFullName().toLowerCase().contains(q))
                        || (b.getUser().getEmail() != null && b.getUser().getEmail().toLowerCase().contains(q))
                        || (b.getUser().getPhone() != null && b.getUser().getPhone().toLowerCase().contains(q))
                );
                if (!matchesCode && !matchesUser) {
                    continue;
                }
            }

            if (status != null && !status.trim().isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                if (b.getPaymentStatus() == null || !b.getPaymentStatus().name().equalsIgnoreCase(status)) {
                    continue;
                }
            }

            String movieTitle = "Không rõ";
            String moviePoster = null;
            String theaterName = "Không rõ";
            String roomName = "Không rõ";
            Instant showtimeStart = null;
            List<String> seats = new ArrayList<>();
            List<AdminBookingDetailResponse.AdminBookingComboItem> comboItems = new ArrayList<>();

            if (b.getTickets() != null) {
                for (Ticket t : b.getTickets()) {
                    if (t.getShowtimeSeat() != null) {
                        Seat seat = t.getShowtimeSeat().getSeat();
                        if (seat != null) {
                            seats.add(seat.getSeatRow() + (seat.getSeatNumber() < 10 ? "0" + seat.getSeatNumber() : seat.getSeatNumber()));
                        }
                        Showtime st = t.getShowtimeSeat().getShowtime();
                        if (st != null) {
                            showtimeStart = st.getStartTime();
                            if (st.getMovie() != null) {
                                movieTitle = st.getMovie().getTitle();
                                moviePoster = st.getMovie().getPoster();
                            }
                            if (st.getRoom() != null) {
                                roomName = st.getRoom().getName();
                                if (st.getRoom().getTheater() != null) {
                                    theaterName = st.getRoom().getTheater().getName();
                                }
                            }
                        }
                    }

                    if (t.getTicketCombos() != null) {
                        for (TicketCombo tc : t.getTicketCombos()) {
                            BigDecimal cPrice = tc.getTotalPrice() != null ? tc.getTotalPrice() : (tc.getUnitPrice() != null ? tc.getUnitPrice().multiply(BigDecimal.valueOf(tc.getQuantity())) : BigDecimal.ZERO);
                            comboItems.add(AdminBookingDetailResponse.AdminBookingComboItem.builder()
                                    .comboName(tc.getCombo() != null ? tc.getCombo().getName() : "Combo")
                                    .quantity(tc.getQuantity())
                                    .price(cPrice)
                                    .build());
                        }
                    }
                }
            }

            String paymentMethod = "CASH";
            Optional<Payment> paymentOpt = paymentRepository.findFirstByBookingOrderByCreatedAtDesc(b);
            if (paymentOpt.isPresent() && paymentOpt.get().getMethod() != null) {
                paymentMethod = paymentOpt.get().getMethod().name();
            }

            result.add(AdminBookingDetailResponse.builder()
                    .bookingId(b.getId())
                    .bookingCode(b.getBookingCode())
                    .bookingTime(b.getBookingTime())
                    .customerId(b.getUser() != null ? b.getUser().getId() : null)
                    .customerName(b.getUser() != null ? b.getUser().getFullName() : "Khách vãng lai")
                    .customerEmail(b.getUser() != null ? b.getUser().getEmail() : "")
                    .customerPhone(b.getUser() != null ? b.getUser().getPhone() : "")
                    .movieTitle(movieTitle)
                    .moviePosterUrl(moviePoster)
                    .theaterName(theaterName)
                    .roomName(roomName)
                    .showtimeStartTime(showtimeStart)
                    .seats(seats)
                    .ticketCount(seats.size())
                    .combos(comboItems)
                    .promotionCode(b.getPromotion() != null ? b.getPromotion().getCode() : null)
                    .totalAmount(b.getTotalAmount())
                    .paymentMethod(paymentMethod)
                    .paymentStatus(b.getPaymentStatus() != null ? b.getPaymentStatus().name() : "PAID")
                    .bookingStatus(b.getBookingStatus() != null ? b.getBookingStatus().name() : "CONFIRMED")
                    .build());
        }

        return result;
    }

    private BigDecimal getComboPrice(TicketCombo tc) {
        if (tc == null) return BigDecimal.ZERO;
        if (tc.getTotalPrice() != null) return tc.getTotalPrice();
        if (tc.getUnitPrice() != null && tc.getQuantity() != null) {
            return tc.getUnitPrice().multiply(BigDecimal.valueOf(tc.getQuantity()));
        }
        return BigDecimal.ZERO;
    }

    private List<Booking> getFilteredBookings(Instant startDate, Instant endDate, UUID movieId, UUID theaterId) {
        List<Booking> bookings;
        if (startDate != null && endDate != null) {
            bookings = bookingRepository.findByBookingTimeBetweenAndPaymentStatusOrderByBookingTimeDesc(
                    startDate, endDate, PaymentStatus.PAID);
        } else {
            bookings = bookingRepository.findByPaymentStatusOrderByBookingTimeDesc(PaymentStatus.PAID);
        }

        if (movieId == null && theaterId == null) {
            return bookings;
        }

        return bookings.stream()
                .filter(b -> {
                    if (b.getTickets() == null) return false;
                    return b.getTickets().stream().anyMatch(t -> isTicketMatching(t, movieId, theaterId));
                })
                .collect(Collectors.toList());
    }

    private boolean isTicketMatching(Ticket ticket, UUID movieId, UUID theaterId) {
        if (ticket == null || ticket.getShowtimeSeat() == null || ticket.getShowtimeSeat().getShowtime() == null) {
            return false;
        }
        Showtime st = ticket.getShowtimeSeat().getShowtime();
        if (movieId != null) {
            if (st.getMovie() == null || !movieId.equals(st.getMovie().getId())) {
                return false;
            }
        }
        if (theaterId != null) {
            if (st.getRoom() == null || st.getRoom().getTheater() == null || !theaterId.equals(st.getRoom().getTheater().getId())) {
                return false;
            }
        }
        return true;
    }

    private boolean isTicketForMovie(Ticket ticket, UUID movieId) {
        if (ticket == null || ticket.getShowtimeSeat() == null || ticket.getShowtimeSeat().getShowtime() == null) return false;
        Showtime st = ticket.getShowtimeSeat().getShowtime();
        return st.getMovie() != null && movieId.equals(st.getMovie().getId());
    }

    private boolean isTicketInTheater(Ticket ticket, UUID theaterId) {
        if (ticket == null || ticket.getShowtimeSeat() == null || ticket.getShowtimeSeat().getShowtime() == null) return false;
        Showtime st = ticket.getShowtimeSeat().getShowtime();
        return st.getRoom() != null && st.getRoom().getTheater() != null && theaterId.equals(st.getRoom().getTheater().getId());
    }

    private Movie getMovieFromTicket(Ticket ticket) {
        if (ticket == null || ticket.getShowtimeSeat() == null || ticket.getShowtimeSeat().getShowtime() == null) return null;
        return ticket.getShowtimeSeat().getShowtime().getMovie();
    }

    private Theater getTheaterFromTicket(Ticket ticket) {
        if (ticket == null || ticket.getShowtimeSeat() == null || ticket.getShowtimeSeat().getShowtime() == null) return null;
        Room room = ticket.getShowtimeSeat().getShowtime().getRoom();
        return room != null ? room.getTheater() : null;
    }

    private Double calculateGrowthRate(Instant startDate, Instant endDate, UUID movieId, UUID theaterId, BigDecimal currentRevenue) {
        if (startDate == null || endDate == null) {
            return 15.2;
        }
        long durationMillis = Duration.between(startDate, endDate).toMillis();
        if (durationMillis <= 0) return 0.0;

        Instant prevStart = startDate.minusMillis(durationMillis);
        Instant prevEnd = startDate;

        List<Booking> prevBookings = bookingRepository.findByBookingTimeBetweenAndPaymentStatusOrderByBookingTimeDesc(
                prevStart, prevEnd, PaymentStatus.PAID);

        BigDecimal prevRevenue = BigDecimal.ZERO;
        for (Booking b : prevBookings) {
            if (movieId != null || theaterId != null) {
                if (b.getTickets() != null && b.getTickets().stream().anyMatch(t -> isTicketMatching(t, movieId, theaterId))) {
                    prevRevenue = prevRevenue.add(b.getTotalAmount() != null ? b.getTotalAmount() : BigDecimal.ZERO);
                }
            } else {
                prevRevenue = prevRevenue.add(b.getTotalAmount() != null ? b.getTotalAmount() : BigDecimal.ZERO);
            }
        }

        if (prevRevenue.compareTo(BigDecimal.ZERO) == 0) {
            return currentRevenue.compareTo(BigDecimal.ZERO) > 0 ? 100.0 : 0.0;
        }

        BigDecimal diff = currentRevenue.subtract(prevRevenue);
        return diff.multiply(BigDecimal.valueOf(100))
                .divide(prevRevenue, 1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private static class MovieStatHolder {
        final Movie movie;
        long ticketsSold = 0;
        BigDecimal ticketRevenue = BigDecimal.ZERO;
        BigDecimal comboRevenue = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        MovieStatHolder(Movie movie) {
            this.movie = movie;
        }
    }

    private static class TheaterStatHolder {
        final Theater theater;
        long ticketsSold = 0;
        BigDecimal ticketRevenue = BigDecimal.ZERO;
        BigDecimal comboRevenue = BigDecimal.ZERO;
        BigDecimal totalRevenue = BigDecimal.ZERO;

        TheaterStatHolder(Theater theater) {
            this.theater = theater;
        }
    }
}
