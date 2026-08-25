package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.ComboRequest;
import com.nhom_5.server.dto.response.ComboResponse;
import com.nhom_5.server.entity.Combo;
import com.nhom_5.server.entity.enums.ComboStatus;
import com.nhom_5.server.repository.ComboRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComboServiceTest {
    @Mock
    private ComboRepository comboRepository;

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
    void deleteComboDeletesExistingCombo() {
        UUID id = UUID.randomUUID();
        Combo combo = Combo.builder().id(id).name("Combo").price(BigDecimal.TEN).status(ComboStatus.ACTIVE).build();
        when(comboRepository.findById(id)).thenReturn(Optional.of(combo));

        comboService.deleteCombo(id);

        verify(comboRepository).delete(combo);
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
