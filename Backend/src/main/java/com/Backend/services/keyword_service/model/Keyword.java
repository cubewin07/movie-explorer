package com.Backend.services.keyword_service.model;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.OneToMany;
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
    name = "keyword",
    indexes = {
        @Index(name = "idx_keyword_name", columnList = "name")
    }
)
public class Keyword {

    @Id
    @Column(name = "keyword_id")
    @EqualsAndHashCode.Include
    private Long keywordId;

    @Column(name = "name", nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private FilmType type;

    @ManyToMany
    @JoinTable(
        name = "film_keyword",
        joinColumns = @JoinColumn(name = "keyword_id"),
        inverseJoinColumns = @JoinColumn(name = "internal_film_id")
    )
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<Film> films = new HashSet<>();

    @OneToMany(mappedBy = "keyword", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<UserKeywordWeight> userWeights = new HashSet<>();
}
