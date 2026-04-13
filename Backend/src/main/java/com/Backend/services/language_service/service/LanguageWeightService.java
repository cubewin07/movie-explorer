package com.Backend.services.language_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.language_service.model.UserLanguageWeight;
import com.Backend.services.language_service.repository.UserLanguageWeightRepository;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.repository.UserFilmReferenceRepository;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class LanguageWeightService {

    private final UserLanguageWeightRepository userLanguageWeightRepository;
    private final UserFilmReferenceRepository userFilmReferenceRepository;

    @Transactional
    public void adjustWeightsForFilm(User user, Film film, long delta) {
        if (user == null || user.getId() == null || film == null || delta == 0) {
            return;
        }
        adjustWeight(user, film.getOriginalLanguage(), delta);
    }

    @Transactional
    public void adjustWeight(User user, String languageCode, long delta) {
        if (user == null || delta == 0) {
            return;
        }

        Long userId = user.getId();
        if (userId == null) {
            return;
        }

        String normalizedLanguageCode = normalizeLanguageCode(languageCode);
        if (!StringUtils.hasText(normalizedLanguageCode)) {
            return;
        }

        userFilmReferenceRepository.ensureUserFilmReference(userId);

        int updated = userLanguageWeightRepository.incrementWeight(userId, normalizedLanguageCode, delta);
        if (updated == 0 && delta <= 0) {
            return;
        }

        if (updated == 0) {
            int inserted = userLanguageWeightRepository.insertIfAbsent(userId, normalizedLanguageCode, delta);
            if (inserted == 0) {
                userLanguageWeightRepository.incrementWeight(userId, normalizedLanguageCode, delta);
            }
        }

        userLanguageWeightRepository.deleteIfNonPositive(userId, normalizedLanguageCode);
    }

    @Transactional(readOnly = true)
    public List<UserLanguageWeight> getWeightsForUser(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return userLanguageWeightRepository.findAllByUserReference_User_Id(userId);
    }

    private String normalizeLanguageCode(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }
}
