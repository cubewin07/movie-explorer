package com.Backend.services.keyword_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.model.TmdbKeywordsResponse;
import com.Backend.services.film_service.model.TmdbKeywordsResponse.KeywordItem;
import com.Backend.services.film_service.service.TmdbClient;
import com.Backend.services.keyword_service.model.Keyword;
import com.Backend.services.keyword_service.repository.KeywordRepository;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class KeywordService {

    private final KeywordRepository keywordRepository;
    private final TmdbClient tmdbClient;

    @Transactional
    public void syncKeywordsForFilm(Long tmdbId, FilmType type, Film film) {
        if (tmdbId == null || type == null || film == null) {
            return;
        }
        TmdbKeywordsResponse keywordsResponse = tmdbClient.fetchKeywords(tmdbId, type);
        if (keywordsResponse == null) {
            return;
        }

        List<KeywordItem> keywords = keywordsResponse.getAllKeywords();
        if (keywords == null || keywords.isEmpty()) {
            return;
        }

        for (KeywordItem keywordInfo : keywords) {
            if (keywordInfo == null || keywordInfo.getId() == null || !StringUtils.hasText(keywordInfo.getName())) {
                continue;
            }
            Keyword keyword = getOrCreateKeyword(keywordInfo.getId(), keywordInfo.getName(), type);
            linkKeywordToFilm(keyword, film);
        }
    }

    @Transactional
    public Keyword getOrCreateKeyword(Long keywordId, String name, FilmType type) {
        Optional<Keyword> existing = keywordRepository.findById(Objects.requireNonNull(keywordId, "keywordId"));
        if (existing.isPresent()) {
            Keyword keyword = existing.get();
            if (StringUtils.hasText(name) && !name.equals(keyword.getName())) {
                keyword.setName(name);
            }
            if (keyword.getType() == null && type != null) {
                keyword.setType(type);
            }
            return keyword;
        }
        Keyword keyword = Keyword.builder()
                .keywordId(keywordId)
                .name(name)
                .type(type)
                .build();
        return keywordRepository.save(Objects.requireNonNull(keyword, "keyword"));
    }

    @Transactional
    public void linkKeywordToFilm(Keyword keyword, Film film) {
        if (keyword == null || film == null) {
            return;
        }
        if (!keyword.getFilms().contains(film)) {
            keyword.getFilms().add(film);
        }
        if (film.getKeywords() != null && !film.getKeywords().contains(keyword)) {
            film.getKeywords().add(keyword);
        }
        keywordRepository.save(keyword);
    }
}
