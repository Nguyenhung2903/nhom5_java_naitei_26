package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ComboRequest;
import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.entity.Combo;
import com.nhom_5.server.entity.enums.ComboStatus;
import com.nhom_5.server.repository.ComboRepository;
import com.nhom_5.server.repository.TicketComboRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ComboService {
    private final ComboRepository comboRepository;
    private final TicketComboRepository ticketComboRepository;

    public List<ComboResponse> getActiveCombos() {
        return comboRepository.findByStatus(ComboStatus.ACTIVE)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ComboResponse> getAllCombos() {
        return comboRepository.findAll().stream().map(this::toResponse).toList();
    }

    public ComboResponse createCombo(ComboRequest request) {
        return toResponse(comboRepository.save(toEntity(request)));
    }

    public ComboResponse updateCombo(UUID id, ComboRequest request) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new com.nhom_5.server.exception.AppException(
                        com.nhom_5.server.exception.ErrorCode.NOT_FOUND, "Không tìm thấy combo với ID: " + id));
        applyRequest(combo, request);
        return toResponse(comboRepository.save(combo));
    }

    @Transactional
    public void deleteCombo(UUID id) {
        Combo combo = comboRepository.findById(id)
                .orElseThrow(() -> new com.nhom_5.server.exception.AppException(
                        com.nhom_5.server.exception.ErrorCode.NOT_FOUND, "Không tìm thấy combo với ID: " + id));
        if (ticketComboRepository.existsByComboId(id)) {
            throw new com.nhom_5.server.exception.AppException(
                    com.nhom_5.server.exception.ErrorCode.BAD_REQUEST,
                    "Không thể xóa combo vì combo này đã được sử dụng trong vé hoặc đơn hàng cũ.");
        }
        comboRepository.delete(combo);
    }

    private Combo toEntity(ComboRequest request) {
        Combo combo = new Combo();
        applyRequest(combo, request);
        return combo;
    }

    private void applyRequest(Combo combo, ComboRequest request) {
        combo.setName(request.getName().trim());
        combo.setDescription(request.getDescription() == null ? null : request.getDescription().trim());
        combo.setPrice(request.getPrice());
        combo.setImage(request.getImage() == null ? null : request.getImage().trim());
        combo.setStatus(request.getStatus());
    }

    private ComboResponse toResponse(Combo combo) {
        return new ComboResponse(
                combo.getId(),
                combo.getName(),
                combo.getDescription(),
                combo.getPrice(),
                combo.getImage(),
                combo.getStatus()
        );
    }
}
