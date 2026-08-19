package com.nhom_5.server.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "genre")
public class Genre extends BaseEntity {

    @Column(name = "name", nullable = false, unique = true)
    private String name;

    @JsonIgnore
    @ManyToMany(mappedBy = "genres")
    @Builder.Default
    private Set<Movie> movies = new HashSet<>();
}
