package com.Backend.services.credit_service.model;

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
    name = "user_credit_weight",
    indexes = {
        @Index(name = "idx_user_credit_weight_user", columnList = "user_id"),
        @Index(name = "idx_user_credit_weight_credit", columnList = "credit_id"),
        @Index(name = "idx_user_credit_weight_role", columnList = "role_id")
    }
)
public class UserCreditWeight {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private UserCreditWeightId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserFilmReference userReference;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("creditId")
    @JoinColumn(name = "credit_id", nullable = false)
    @JsonIgnore
    private Credit credit;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("roleId")
    @JoinColumn(name = "role_id", nullable = false)
    @JsonIgnore
    private Role role;

    private Long weight;
}
