package com.Backend.services.keyword_service.model;

import com.Backend.services.FilmType;
import com.Backend.services.user_service.model.UserFilmReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Table(
    name = "user_keyword_weight",
    indexes = {
        @Index(name = "idx_user_keyword_weight_user", columnList = "user_id"),
        @Index(name = "idx_user_keyword_weight_keyword", columnList = "keyword_id")
    }
)
public class UserKeywordWeight {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserKeywordWeightId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserFilmReference userReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("keywordId")
    @JoinColumn(name = "keyword_id", nullable = false)
    @JsonIgnore
    private Keyword keyword;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private FilmType type;

    private Long weight;
}
