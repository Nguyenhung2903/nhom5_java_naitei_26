package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ComboRequest;
import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.entity.Combo;
import com.nhom_5.server.entity.enums.ComboStatus;
import com.nhom_5.server.repository.ComboRepository;
import com.nhom_5.server.repository.TicketComboRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComboServiceTest {
    @Mock
    private ComboRepository comboRepository;

    @Mock
    private TicketComboRepository ticketComboRepository;

    @InjectMocks
    private ComboService comboService;

    @Test
    void createComboPersistsNormalizedFields() {
        ComboRequest request = request();
        when(comboRepository.save(any(Combo.class))).thenAnswer(invocation -> {
            Combo combo = invocation.getArgument(0);
            combo.setId(UUID.randomUUID());
            return combo;
        });

        ComboResponse response = comboService.createCombo(request);

        assertEquals("Popcorn + Coke", response.getName());
        assertEquals(new BigDecimal("50000"), response.getPrice());
        assertEquals(ComboStatus.ACTIVE, response.getStatus());
    }

    @Test
    void updateComboChangesExistingCombo() {
        UUID id = UUID.randomUUID();
        Combo combo = Combo.builder().id(id).name("Old").price(BigDecimal.TEN).status(ComboStatus.INACTIVE).build();
        when(comboRepository.findById(id)).thenReturn(Optional.of(combo));
        when(comboRepository.save(combo)).thenReturn(combo);

        ComboResponse response = comboService.updateCombo(id, request());

        assertEquals("Popcorn + Coke", response.getName());
        verify(comboRepository).save(combo);
    }

    @Test
    void deleteComboDeletesExistingComboAndReferences() {
        UUID id = UUID.randomUUID();
        Combo combo = Combo.builder().id(id).name("Combo").price(BigDecimal.TEN).status(ComboStatus.ACTIVE).build();
        when(comboRepository.findById(id)).thenReturn(Optional.of(combo));
        when(ticketComboRepository.existsByComboId(id)).thenReturn(false);

        comboService.deleteCombo(id);

        verify(comboRepository).delete(combo);
    }

    @Test
    void deleteComboRejectsComboUsedByExistingTicket() {
        UUID id = UUID.randomUUID();
        Combo combo = Combo.builder().id(id).name("Combo").price(BigDecimal.TEN).status(ComboStatus.ACTIVE).build();
        when(comboRepository.findById(id)).thenReturn(Optional.of(combo));
        when(ticketComboRepository.existsByComboId(id)).thenReturn(true);

        RuntimeException exception = assertThrows(RuntimeException.class, () -> comboService.deleteCombo(id));

        assertEquals("Không thể xóa combo vì combo này đã được sử dụng trong vé hoặc đơn hàng cũ.", exception.getMessage());
        verify(comboRepository, never()).delete(combo);
    }

    private ComboRequest request() {
        return ComboRequest.builder()
                .name("  Popcorn + Coke  ")
                .description("  Couple combo  ")
                .price(new BigDecimal("50000"))
                .image("  image-url  ")
                .status(ComboStatus.ACTIVE)
                .build();
    }
}
