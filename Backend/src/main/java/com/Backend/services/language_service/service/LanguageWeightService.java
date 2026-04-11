package com.Backend.services.language_service.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.language_service.model.UserLanguageWeight;
import com.Backend.services.language_service.model.UserLanguageWeightId;
import com.Backend.services.language_service.repository.UserLanguageWeightRepository;
import com.Backend.services.user_service.model.User;
import com.Backend.services.user_service.model.UserFilmReference;
import com.Backend.services.user_service.repository.UserFilmReferenceRepository;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Objects;
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
        UserFilmReference userReference = userFilmReferenceRepository.findById(userId).orElse(null);
        if (userReference == null) {
            return;
        }

        UserLanguageWeightId id = new UserLanguageWeightId(userId, normalizedLanguageCode);
        UserLanguageWeight current = userLanguageWeightRepository.findById(id).orElse(null);

        if (current == null) {
            if (delta <= 0) {
                return;
            }
            UserLanguageWeight created = UserLanguageWeight.builder()
                    .id(id)
                    .userReference(userReference)
                    .weight(delta)
                    .build();
            userLanguageWeightRepository.save(Objects.requireNonNull(created, "language weight"));
            return;
        }

        long nextWeight = current.getWeight() + delta;
        if (nextWeight <= 0) {
            userLanguageWeightRepository.delete(current);
            return;
        }

        current.setWeight(nextWeight);
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
