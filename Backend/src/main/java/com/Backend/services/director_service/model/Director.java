package com.Backend.services.director_service.model;

import com.Backend.services.film_service.model.Film;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import java.util.HashSet;
import java.util.Set;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "director",
    indexes = {
        @Index(name = "idx_director_name", columnList = "name")
    }
)
public class Director {

    @Id
    @Column(name = "director_id")
    @EqualsAndHashCode.Include
    private Long directorId;

    @Column(name = "name", nullable = false)
    private String name;

    @ManyToMany
    @JoinTable(
        name = "director_film",
        joinColumns = @JoinColumn(name = "director_id"),
        inverseJoinColumns = @JoinColumn(name = "internal_film_id")
    )
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<Film> films = new HashSet<>();
}
