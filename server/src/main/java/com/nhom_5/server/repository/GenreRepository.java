package com.nhom_5.server.repository;

import com.nhom_5.server.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface GenreRepository extends JpaRepository<Genre, UUID> {

    Optional<Genre> findByNameIgnoreCase(String name);
}
