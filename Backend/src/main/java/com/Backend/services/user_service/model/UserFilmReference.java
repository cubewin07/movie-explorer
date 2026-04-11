package com.Backend.services.user_service.model;

import com.Backend.services.director_service.model.UserDirectorWeight;
import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.language_service.model.UserLanguageWeight;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
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
@Table(name = "user_film_reference")
public class UserFilmReference {

    @Id
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private Long userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @OneToMany(mappedBy = "userReference", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<UserDirectorWeight> directorWeights = new HashSet<>();

    @OneToMany(mappedBy = "userReference", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<UserKeywordWeight> keywordWeights = new HashSet<>();

    @OneToMany(mappedBy = "userReference", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<UserGenreWeight> genreWeights = new HashSet<>();

    @OneToMany(mappedBy = "userReference", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<UserLanguageWeight> languageWeights = new HashSet<>();
}
