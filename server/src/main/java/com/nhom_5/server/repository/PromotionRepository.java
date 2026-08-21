package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Promotion;
import com.nhom_5.server.entity.enums.PromotionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    Optional<Promotion> findByCode(String code);

    boolean existsByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCaseAndIdNot(String code, UUID id);

    @Query("""
            SELECT p
            FROM Promotion p
            WHERE (LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%')))
              AND p.status = :status
            ORDER BY p.startDate DESC, p.createdAt DESC
            """)
    List<Promotion> searchByKeywordAndStatus(@Param("keyword") String keyword, @Param("status") PromotionStatus status);

    @Query("""
            SELECT p
            FROM Promotion p
            WHERE LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(p.code) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY p.startDate DESC, p.createdAt DESC
            """)
    List<Promotion> searchByKeyword(@Param("keyword") String keyword);

    List<Promotion> findByStatusOrderByStartDateDescCreatedAtDesc(PromotionStatus status);

    List<Promotion> findAllByOrderByStartDateDescCreatedAtDesc();
}
