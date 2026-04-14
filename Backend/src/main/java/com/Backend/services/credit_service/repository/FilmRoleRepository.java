package com.Backend.services.credit_service.repository;

import com.Backend.services.credit_service.model.FilmRole;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FilmRoleRepository extends JpaRepository<FilmRole, Long> {
    boolean existsByFilm_InternalIdAndCredit_CreditsIdAndRole_RoleId(Long filmId, Long creditId, Long roleId);

    boolean existsByFilm_InternalId(Long filmInternalId);

    List<FilmRole> findAllByFilm_InternalId(Long filmInternalId);
}
