package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    Optional<Payment> findFirstByBookingOrderByCreatedAtDesc(com.nhom_5.server.entity.Booking booking);
}
