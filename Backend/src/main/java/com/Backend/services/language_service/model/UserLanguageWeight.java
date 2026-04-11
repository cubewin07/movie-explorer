package com.Backend.services.language_service.model;

import com.Backend.services.user_service.model.UserFilmReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
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
    name = "user_language_weight",
    indexes = {
        @Index(name = "idx_user_language_weight_user", columnList = "user_id"),
        @Index(name = "idx_user_language_weight_language", columnList = "language_code")
    }
)
public class UserLanguageWeight {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserLanguageWeightId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserFilmReference userReference;

    private Long weight;
}
