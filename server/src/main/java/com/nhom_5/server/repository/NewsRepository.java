package com.nhom_5.server.repository;

import com.nhom_5.server.entity.News;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface NewsRepository extends JpaRepository<News, UUID> {

    @Query("""
            SELECT n
            FROM News n
            WHERE LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(n.content) LIKE LOWER(CONCAT('%', :keyword, '%'))
            ORDER BY n.createdAt DESC
            """)
    List<News> search(@Param("keyword") String keyword);

    List<News> findAllByOrderByCreatedAtDesc();
}
