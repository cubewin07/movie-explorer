package com.Backend.services.credit_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.credit_service.model.Credit;
import com.Backend.services.credit_service.model.FilmRole;
import com.Backend.services.credit_service.model.Role;
import com.Backend.services.credit_service.model.RoleGroup;
import com.Backend.services.credit_service.repository.CreditRepository;
import com.Backend.services.credit_service.repository.FilmRoleRepository;
import com.Backend.services.credit_service.repository.RoleRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbCreditsResponse;
import com.Backend.services.film_service.model.TmdbCreditsResponse.CastMember;
import com.Backend.services.film_service.model.TmdbCreditsResponse.CrewMember;
import com.Backend.services.film_service.service.TmdbClient;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class CreditService {

    public static final String ROLE_CODE_CAST = "CAST";
    public static final String ROLE_CODE_DIRECTOR = "DIRECTOR";
    public static final String ROLE_CODE_CREW = "CREW";
    private static final String DIRECTOR_JOB = "Director";

    private final CreditRepository creditRepository;
    private final FilmRoleRepository filmRoleRepository;
    private final RoleRepository roleRepository;
    private final TmdbClient tmdbClient;

    @Transactional
    public void syncCreditsForFilm(Long tmdbId, FilmType type, Film film) {
        if (tmdbId == null || type == null || film == null || film.getInternalId() == null) {
            return;
        }

        TmdbCreditsResponse credits = tmdbClient.fetchCredits(tmdbId, type);
        if (credits == null) {
            return;
        }

        Role castRole = ensureRole(ROLE_CODE_CAST, "Cast", RoleGroup.CAST);
        Role directorRole = ensureRole(ROLE_CODE_DIRECTOR, "Director", RoleGroup.CREW);
        Role crewRole = ensureRole(ROLE_CODE_CREW, "Crew", RoleGroup.CREW);

        Set<String> seen = new HashSet<>();

        if (credits.getCast() != null) {
            for (CastMember castMember : credits.getCast()) {
                upsertFilmRole(film, castRole, castMember != null ? castMember.getId() : null,
                        castMember != null ? castMember.getName() : null,
                        castMember != null ? castMember.getDepartment() : null,
                        castMember != null ? castMember.getProfilePath() : null,
                        castMember != null ? castMember.getCharacter() : null,
                        null,
                        seen);
            }
        }

        if (credits.getCrew() != null) {
            for (CrewMember crewMember : credits.getCrew()) {
                Role role = crewMember != null && DIRECTOR_JOB.equalsIgnoreCase(crewMember.getJob())
                        ? directorRole
                        : crewRole;
                upsertFilmRole(film, role, crewMember != null ? crewMember.getId() : null,
                        crewMember != null ? crewMember.getName() : null,
                        crewMember != null ? crewMember.getDepartment() : null,
                        crewMember != null ? crewMember.getProfilePath() : null,
                        null,
                        crewMember != null ? crewMember.getJob() : null,
                        seen);
            }
        }
    }

    @Transactional
    public Credit getOrCreateCredit(Long creditId, String name, String department, String profilePath) {
        if (creditId == null || !StringUtils.hasText(name)) {
            return null;
        }

        Optional<Credit> existing = creditRepository.findById(creditId);
        if (existing.isPresent()) {
            Credit credit = existing.get();
            if (StringUtils.hasText(name) && !name.equals(credit.getName())) {
                credit.setName(name);
            }
            if (StringUtils.hasText(department)) {
                credit.setDepartment(department);
            }
            if (StringUtils.hasText(profilePath)) {
                credit.setProfilePath(profilePath);
            }
            return credit;
        }

        Credit credit = Credit.builder()
                .creditsId(creditId)
                .name(name)
                .department(department)
                .profilePath(profilePath)
                .build();
        return creditRepository.save(credit);
    }

    private void upsertFilmRole(
            Film film,
            Role role,
            Long creditId,
            String creditName,
            String department,
            String profilePath,
            String characterName,
            String jobName,
            Set<String> seen
    ) {
        if (film == null || film.getInternalId() == null || role == null || role.getRoleId() == null) {
            return;
        }
        if (creditId == null || !StringUtils.hasText(creditName)) {
            return;
        }

        String dedupeKey = role.getRoleId() + ":" + creditId;
        if (!seen.add(dedupeKey)) {
            return;
        }

        Credit credit = getOrCreateCredit(creditId, creditName, department, profilePath);
        if (credit == null || credit.getCreditsId() == null) {
            return;
        }

        boolean exists = filmRoleRepository.existsByFilm_InternalIdAndCredit_CreditsIdAndRole_RoleId(
                film.getInternalId(),
                credit.getCreditsId(),
                role.getRoleId()
        );
        if (exists) {
            return;
        }

        FilmRole filmRole = FilmRole.builder()
                .film(film)
                .credit(credit)
                .role(role)
                .characterName(characterName)
                .jobName(jobName)
                .build();

        filmRoleRepository.save(filmRole);

        if (film.getFilmRoles() != null) {
            film.getFilmRoles().add(filmRole);
        }
    }

    private Role ensureRole(String roleCode, String roleName, RoleGroup roleGroup) {
        return roleRepository.findByRoleCode(roleCode)
                .map(existing -> {
                    if (!roleName.equals(existing.getRoleName())) {
                        existing.setRoleName(roleName);
                    }
                    if (existing.getRoleGroup() != roleGroup) {
                        existing.setRoleGroup(roleGroup);
                    }
                    return existing;
                })
                .orElseGet(() -> roleRepository.save(Role.builder()
                        .roleCode(roleCode)
                        .roleName(roleName)
                        .roleGroup(roleGroup)
                        .build()));
    }
}
