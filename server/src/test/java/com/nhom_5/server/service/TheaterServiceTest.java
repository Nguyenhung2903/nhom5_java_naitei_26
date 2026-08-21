package com.nhom_5.server.service;

import com.nhom_5.server.dto.request.TheaterRequest;
import com.nhom_5.server.entity.Theater;
import com.nhom_5.server.exception.AppException;
import com.nhom_5.server.exception.ErrorCode;
import com.nhom_5.server.repository.RoomRepository;
import com.nhom_5.server.repository.TheaterRepository;
import com.nhom_5.server.service.impl.TheaterServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TheaterServiceTest {
    @Mock
    private TheaterRepository theaterRepository;
    @Mock
    private RoomRepository roomRepository;
    @InjectMocks
    private TheaterServiceImpl theaterService;

    @Test
    void createRejectsDuplicateName() {
        TheaterRequest request = new TheaterRequest();
        request.setName("CGV");
        request.setAddress("Hanoi");
        when(theaterRepository.existsByNameIgnoreCase("CGV")).thenReturn(true);

        AppException exception = assertThrows(AppException.class, () -> theaterService.create(request));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
    }

    @Test
    void getByIdRejectsMissingTheater() {
        UUID id = UUID.randomUUID();
        when(theaterRepository.findById(id)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> theaterService.getById(id));

        assertEquals(ErrorCode.NOT_FOUND, exception.getErrorCode());
    }

    @Test
    void createReturnsSavedTheater() {
        TheaterRequest request = new TheaterRequest();
        request.setName("CGV");
        request.setAddress("Hanoi");
        Theater saved = Theater.builder().id(UUID.randomUUID()).name("CGV").address("Hanoi").build();
        when(theaterRepository.existsByNameIgnoreCase("CGV")).thenReturn(false);
        when(theaterRepository.save(any(Theater.class))).thenReturn(saved);

        assertEquals(saved.getId(), theaterService.create(request).getId());
    }
}
