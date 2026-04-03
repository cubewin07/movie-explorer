package com.Backend.services.keyword_service.service;

import com.Backend.services.keyword_service.model.Keyword;
import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.model.UserKeywordWeightId;
import com.Backend.services.keyword_service.repository.UserKeywordWeightRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.user_service.model.User;
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
public class KeywordWeightService {

    private final UserKeywordWeightRepository userKeywordWeightRepository;
    private final WatchlistItemRepository watchlistItemRepository;

    @Transactional
    public void adjustWeightsForFilm(User user, Film film, long delta) {
        if (user == null || user.getId() == null || film == null || delta == 0) {
            return;
        }
        Set<Keyword> keywords = film.getKeywords();
        if (keywords == null || keywords.isEmpty()) {
            return;
        }
        for (Keyword keyword : keywords) {
            adjustWeight(user, keyword, delta);
        }
    }

    @Transactional
    public void adjustWeight(User user, Keyword keyword, long delta) {
        if (user == null
                || user.getId() == null
                || keyword == null
                || keyword.getKeywordId() == null
                || keyword.getType() == null
                || delta == 0) {
            return;
        }

        userKeywordWeightRepository.ensureUserFilmReference(user.getId());

        UserKeywordWeightId id = new UserKeywordWeightId(user.getId(), keyword.getKeywordId());
        UserKeywordWeight current = userKeywordWeightRepository.findById(id).orElse(null);

        if (current == null) {
            if (delta <= 0) {
                return;
            }
            UserKeywordWeight created = UserKeywordWeight.builder()
                    .id(id)
                    .user(user)
                    .keyword(keyword)
                    .type(keyword.getType())
                    .weight(delta)
                    .build();
            userKeywordWeightRepository.save(Objects.requireNonNull(created, "keyword weight"));
            return;
        }

        long nextWeight = current.getWeight() + delta;
        if (nextWeight <= 0) {
            userKeywordWeightRepository.delete(current);
            return;
        }

        current.setWeight(nextWeight);
        current.setType(keyword.getType());
    }

    @Transactional
    public void backfillWeightsForFilm(Film film) {
        if (film == null || film.getInternalId() == null || !Boolean.TRUE.equals(film.getKeywordSyncCompleted())) {
            return;
        }
        Set<Keyword> keywords = film.getKeywords();
        if (keywords == null || keywords.isEmpty()) {
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
            for (Keyword keyword : keywords) {
                adjustWeight(user, keyword, 1L);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<UserKeywordWeight> getWeightsForUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return userKeywordWeightRepository.findAllByUser_Id(userId);
    }
}
