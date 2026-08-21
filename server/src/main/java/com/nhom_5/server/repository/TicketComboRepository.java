package com.nhom_5.server.repository;

import com.nhom_5.server.entity.TicketCombo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TicketComboRepository extends JpaRepository<TicketCombo, UUID> {
}
