package com.Backend.services.credit_service.service;

import com.Backend.services.credit_service.model.Credit;
import com.Backend.services.credit_service.model.FilmRole;
import com.Backend.services.credit_service.model.Role;
import com.Backend.services.credit_service.model.UserCreditWeight;
import com.Backend.services.credit_service.model.UserCreditWeightId;
import com.Backend.services.credit_service.repository.UserCreditWeightRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.UserFilmReference;
import com.Backend.services.user_service.repository.UserFilmReferenceRepository;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CreditWeightService {

    private final UserCreditWeightRepository userCreditWeightRepository;
    private final UserFilmReferenceRepository userFilmReferenceRepository;
    private final WatchlistItemRepository watchlistItemRepository;

    @Transactional
    public void adjustWeightsForFilm(User user, Film film, long delta) {
        if (user == null || user.getId() == null || film == null || delta == 0) {
            return;
        }
        Set<FilmRole> filmRoles = film.getFilmRoles();
        if (filmRoles == null || filmRoles.isEmpty()) {
            return;
        }
        for (FilmRole filmRole : filmRoles) {
            if (filmRole == null) {
                continue;
            }
            adjustWeight(user, filmRole.getCredit(), filmRole.getRole(), delta);
        }
    }

    @Transactional
    public void adjustWeight(User user, Credit credit, Role role, long delta) {
        if (user == null || delta == 0) {
            return;
        }

        Long userId = user.getId();
        Long creditId = credit != null ? credit.getCreditsId() : null;
        Long roleId = role != null ? role.getRoleId() : null;
        if (userId == null || creditId == null || roleId == null) {
            return;
        }

        userFilmReferenceRepository.ensureUserFilmReference(userId);
        UserFilmReference userReference = userFilmReferenceRepository.findById(userId).orElse(null);
        if (userReference == null) {
            return;
        }

        UserCreditWeightId id = new UserCreditWeightId(userId, creditId, roleId);
        UserCreditWeight current = userCreditWeightRepository.findById(id).orElse(null);

        if (current == null) {
            if (delta <= 0) {
                return;
            }
            UserCreditWeight created = UserCreditWeight.builder()
                    .id(id)
                    .userReference(userReference)
                    .credit(credit)
                    .role(role)
                    .weight(delta)
                    .build();
            userCreditWeightRepository.save(Objects.requireNonNull(created, "credit weight"));
            return;
        }

        long nextWeight = current.getWeight() + delta;
        if (nextWeight <= 0) {
            userCreditWeightRepository.delete(current);
            return;
        }

        current.setWeight(nextWeight);
    }

    @Transactional
    public void backfillWeightsForFilm(Film film) {
        if (film == null || film.getInternalId() == null || !Boolean.TRUE.equals(film.getCreditsSyncCompleted())) {
            return;
        }
        Set<FilmRole> filmRoles = film.getFilmRoles();
        if (filmRoles == null || filmRoles.isEmpty()) {
            return;
        }

        List<WatchlistItem> items = watchlistItemRepository.findAllByFilm_InternalId(film.getInternalId());
        for (WatchlistItem item : items) {
            if (item == null || item.getWatchlist() == null) {
                continue;
            }
            User user = item.getWatchlist().getUser();
            if (user == null || user.getId() == null) {
                continue;
            }
            for (FilmRole filmRole : filmRoles) {
                if (filmRole == null) {
                    continue;
                }
                adjustWeight(user, filmRole.getCredit(), filmRole.getRole(), 1L);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<UserCreditWeight> getWeightsForUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return userCreditWeightRepository.findAllByUserReference_User_Id(userId);
    }
}
