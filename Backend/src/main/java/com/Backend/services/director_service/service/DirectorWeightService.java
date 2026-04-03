package com.Backend.services.director_service.service;

import com.Backend.services.director_service.model.Director;
import com.Backend.services.director_service.model.UserDirectorWeight;
import com.Backend.services.director_service.model.UserDirectorWeightId;
import com.Backend.services.director_service.repository.UserDirectorWeightRepository;
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
public class DirectorWeightService {

    private final UserDirectorWeightRepository userDirectorWeightRepository;
    private final UserFilmReferenceRepository userFilmReferenceRepository;
    private final WatchlistItemRepository watchlistItemRepository;

    @Transactional
    public void adjustWeightsForFilm(User user, Film film, long delta) {
        if (user == null || user.getId() == null || film == null || delta == 0) {
            return;
        }
        Set<Director> directors = film.getDirectors();
        if (directors == null || directors.isEmpty()) {
            return;
        }
        for (Director director : directors) {
            adjustWeight(user, director, delta);
        }
    }

    @Transactional
    public void adjustWeight(User user, Director director, long delta) {
        if (user == null || user.getId() == null || director == null || director.getDirectorId() == null || delta == 0) {
            return;
        }

        userFilmReferenceRepository.ensureUserFilmReference(user.getId());
        UserFilmReference userReference = userFilmReferenceRepository.findById(user.getId()).orElse(null);
        if (userReference == null) {
            return;
        }

        UserDirectorWeightId id = new UserDirectorWeightId(user.getId(), director.getDirectorId());
        UserDirectorWeight current = userDirectorWeightRepository.findById(id).orElse(null);

        if (current == null) {
            if (delta <= 0) {
                return;
            }
            UserDirectorWeight created = UserDirectorWeight.builder()
                    .id(id)
                    .userReference(userReference)
                    .director(director)
                    .weight(delta)
                    .build();
                userDirectorWeightRepository.save(Objects.requireNonNull(created, "director weight"));
            return;
        }

        long nextWeight = current.getWeight() + delta;
        if (nextWeight <= 0) {
            userDirectorWeightRepository.delete(current);
            return;
        }

        current.setWeight(nextWeight);
    }

    @Transactional
    public void backfillWeightsForFilm(Film film) {
        if (film == null || film.getInternalId() == null || !Boolean.TRUE.equals(film.getDirectorSyncCompleted())) {
            return;
        }
        Set<Director> directors = film.getDirectors();
        if (directors == null || directors.isEmpty()) {
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
            for (Director director : directors) {
                adjustWeight(user, director, 1L);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<UserDirectorWeight> getWeightsForUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return userDirectorWeightRepository.findAllByUserReference_User_Id(userId);
    }
}
