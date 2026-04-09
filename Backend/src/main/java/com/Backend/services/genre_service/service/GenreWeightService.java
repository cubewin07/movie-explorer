package com.Backend.services.genre_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.genre_service.model.Genre;
import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.model.UserGenreWeightId;
import com.Backend.services.genre_service.repository.UserGenreWeightRepository;
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
public class GenreWeightService {

    private final UserGenreWeightRepository userGenreWeightRepository;
    private final UserFilmReferenceRepository userFilmReferenceRepository;
    private final WatchlistItemRepository watchlistItemRepository;

    @Transactional
    public void adjustWeightsForFilm(User user, Film film, long delta) {
        if (user == null || user.getId() == null || film == null || delta == 0) {
            return;
        }
        Set<Genre> genres = film.getGenres();
        if (genres == null || genres.isEmpty()) {
            return;
        }
        for (Genre genre : genres) {
            adjustWeight(user, genre, delta);
        }
    }

    @Transactional
    public void adjustWeight(User user, Genre genre, long delta) {
        if (user == null
                || user.getId() == null
                || genre == null
                || genre.getGenreId() == null
                || genre.getType() == null
                || delta == 0) {
            return;
        }

        userFilmReferenceRepository.ensureUserFilmReference(user.getId());
        UserFilmReference userReference = userFilmReferenceRepository.findById(user.getId()).orElse(null);
        if (userReference == null) {
            return;
        }

        UserGenreWeightId id = new UserGenreWeightId(user.getId(), genre.getGenreId());
        UserGenreWeight current = userGenreWeightRepository.findById(id).orElse(null);

        if (current == null) {
            if (delta <= 0) {
                return;
            }
            UserGenreWeight created = UserGenreWeight.builder()
                    .id(id)
                    .userReference(userReference)
                    .genre(genre)
                    .type(genre.getType())
                    .weight(delta)
                    .build();
            userGenreWeightRepository.save(Objects.requireNonNull(created, "genre weight"));
            return;
        }

        long nextWeight = current.getWeight() + delta;
        if (nextWeight <= 0) {
            userGenreWeightRepository.delete(current);
            return;
        }

        current.setWeight(nextWeight);
        current.setType(genre.getType());
    }

    @Transactional
    public void backfillWeightsForFilm(Film film) {
        if (film == null || film.getInternalId() == null || !Boolean.TRUE.equals(film.getGenreSyncCompleted())) {
            return;
        }
        Set<Genre> genres = film.getGenres();
        if (genres == null || genres.isEmpty()) {
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
            for (Genre genre : genres) {
                adjustWeight(user, genre, 1L);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<UserGenreWeight> getWeightsForUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return userGenreWeightRepository.findAllByUserReference_User_Id(userId);
    }
}
