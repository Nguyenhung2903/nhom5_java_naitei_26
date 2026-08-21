package com.nhom_5.server.config;

import com.nhom_5.server.entity.Promotion;
import com.nhom_5.server.entity.enums.DiscountType;
import com.nhom_5.server.entity.enums.PromotionStatus;
import com.nhom_5.server.repository.PromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Configuration
@RequiredArgsConstructor
public class DataSeederConfig {

    private final PromotionRepository promotionRepository;

    @Bean
    public CommandLineRunner seedData() {
        return args -> {
            // Khởi tạo mã giảm giá SUNASTERISK nếu chưa có
            if (promotionRepository.findByCode("SUNASTERISK").isEmpty()) {
                Promotion promotion = Promotion.builder()
                        .code("SUNASTERISK")
                        .title("Khuyến mãi Sun*")
                        .description("Giảm 10% tổng hoá đơn")
                        .discountType(DiscountType.PERCENT)
                        .discountValue(BigDecimal.valueOf(10))
                        .startDate(Instant.now().minus(1, ChronoUnit.DAYS))
                        .endDate(Instant.now().plus(30, ChronoUnit.DAYS))
                        .status(PromotionStatus.ACTIVE)
                        .build();
                promotionRepository.save(promotion);
            }
        };
    }
}
