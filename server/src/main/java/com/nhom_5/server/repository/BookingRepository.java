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
    List<Booking> findByBookingTimeBetweenAndPaymentStatusOrderByBookingTimeDesc(
            java.time.Instant startTime,
            java.time.Instant endTime,
            com.nhom_5.server.entity.enums.PaymentStatus paymentStatus
    );
    List<Booking> findByPaymentStatusOrderByBookingTimeDesc(com.nhom_5.server.entity.enums.PaymentStatus paymentStatus);
}
