package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Combo;
import com.nhom_5.server.entity.enums.ComboStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ComboRepository extends JpaRepository<Combo, UUID> {
    List<Combo> findByStatus(ComboStatus status);
}
