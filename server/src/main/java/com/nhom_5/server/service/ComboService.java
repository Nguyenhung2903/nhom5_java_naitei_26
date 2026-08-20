package com.nhom_5.server.service;

import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.entity.Combo;
import com.nhom_5.server.entity.enums.ComboStatus;
import com.nhom_5.server.repository.ComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComboService {
    private final ComboRepository comboRepository;

    public List<ComboResponse> getActiveCombos() {
        return comboRepository.findByStatus(ComboStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private ComboResponse toResponse(Combo combo) {
        return new ComboResponse(
                combo.getId(),
                combo.getName(),
                combo.getDescription(),
                combo.getPrice(),
                combo.getImage()
        );
    }
}
