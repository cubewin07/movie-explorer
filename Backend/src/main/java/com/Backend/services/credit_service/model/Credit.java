package com.Backend.services.credit_service.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
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
    name = "credit",
    indexes = {
        @Index(name = "idx_credit_name", columnList = "name")
    }
)
public class Credit {

    @Id
    @Column(name = "credit_id")
    @EqualsAndHashCode.Include
    private Long creditsId;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "department")
    private String department;

    @Column(name = "profile_path")
    private String profilePath;

    @OneToMany(mappedBy = "credit", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<FilmRole> filmRoles = new HashSet<>();

    @OneToMany(mappedBy = "credit", orphanRemoval = true)
    @JsonIgnore
    @ToString.Exclude
    @Builder.Default
    private Set<UserCreditWeight> userWeights = new HashSet<>();
}
