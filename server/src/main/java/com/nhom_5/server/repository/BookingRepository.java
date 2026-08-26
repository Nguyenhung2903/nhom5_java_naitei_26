package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import com.nhom_5.server.entity.User;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, UUID> {
    List<Booking> findByUserOrderByBookingTimeDesc(User user);
    List<Booking> findByUserAndPaymentStatusOrderByBookingTimeDesc(User user, com.nhom_5.server.entity.enums.PaymentStatus paymentStatus);

    @org.springframework.data.jpa.repository.Query("""
            SELECT DISTINCT b
            FROM Booking b
            LEFT JOIN FETCH b.tickets t
            LEFT JOIN FETCH t.showtimeSeat ss
            LEFT JOIN FETCH ss.seat s
            LEFT JOIN FETCH ss.showtime st
            LEFT JOIN FETCH st.movie m
            LEFT JOIN FETCH st.room r
            LEFT JOIN FETCH r.theater th
            WHERE b.user = :user
              AND b.paymentStatus = :paymentStatus
            ORDER BY b.bookingTime DESC
            """)
    List<Booking> findByUserAndPaymentStatusWithDetails(
            @org.springframework.data.repository.query.Param("user") User user,
            @org.springframework.data.repository.query.Param("paymentStatus") com.nhom_5.server.entity.enums.PaymentStatus paymentStatus);

    List<Booking> findByBookingTimeBetweenAndPaymentStatusOrderByBookingTimeDesc(
            java.time.Instant startTime,
            java.time.Instant endTime,
            com.nhom_5.server.entity.enums.PaymentStatus paymentStatus
    );
    List<Booking> findByPaymentStatusOrderByBookingTimeDesc(com.nhom_5.server.entity.enums.PaymentStatus paymentStatus);
}
