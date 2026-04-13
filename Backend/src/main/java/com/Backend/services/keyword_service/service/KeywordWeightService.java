package com.Backend.services.keyword_service.service;

import com.Backend.services.keyword_service.model.Keyword;
import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.repository.UserKeywordWeightRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserFilmReferenceRepository;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.repository.WatchlistItemRepository;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class KeywordWeightService {

    private final UserKeywordWeightRepository userKeywordWeightRepository;
    private final UserFilmReferenceRepository userFilmReferenceRepository;
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

        Long userId = user.getId();
        Long keywordId = keyword.getKeywordId();
        String type = keyword.getType().name();

        userFilmReferenceRepository.ensureUserFilmReference(userId);

        int updated = userKeywordWeightRepository.incrementWeight(userId, keywordId, delta, type);
        if (updated == 0 && delta <= 0) {
            return;
        }

        if (updated == 0) {
            int inserted = userKeywordWeightRepository.insertIfAbsent(userId, keywordId, delta, type);
            if (inserted == 0) {
                userKeywordWeightRepository.incrementWeight(userId, keywordId, delta, type);
            }
        }

        userKeywordWeightRepository.deleteIfNonPositive(userId, keywordId);
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
        return userKeywordWeightRepository.findAllByUserReference_User_Id(userId);
    }
}
