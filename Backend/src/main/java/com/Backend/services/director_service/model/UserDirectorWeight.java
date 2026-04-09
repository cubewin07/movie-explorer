package com.Backend.services.director_service.model;

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
    name = "user_director_weight",
    indexes = {
        @Index(name = "idx_user_director_weight_user", columnList = "user_id"),
        @Index(name = "idx_user_director_weight_director", columnList = "director_id")
    }
)
public class UserDirectorWeight {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserDirectorWeightId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserFilmReference userReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("directorId")
    @JoinColumn(name = "director_id", nullable = false)
    @JsonIgnore
    private Director director;

    private Long weight;
}
