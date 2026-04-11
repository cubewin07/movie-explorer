package com.Backend.services.recommendation_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.credit_service.model.FilmRole;
import com.Backend.services.credit_service.model.UserCreditWeight;
import com.Backend.services.credit_service.repository.UserCreditWeightRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.repository.UserGenreWeightRepository;
import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.repository.UserKeywordWeightRepository;
import com.Backend.services.language_service.model.UserLanguageWeight;
import com.Backend.services.language_service.repository.UserLanguageWeightRepository;
import com.Backend.services.recommendation_service.model.RecommendationResultDTO;
import com.Backend.services.recommendation_service.repository.RecommendationRepository;
import com.Backend.services.user_service.model.User;
import com.Backend.services.watchlist_service.model.Watchlist;
import com.Backend.services.watchlist_service.model.WatchlistItem;
import com.Backend.services.watchlist_service.repository.WatchlistRepository;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class RecommendationQueryService {

    private static final String ROLE_CODE_DIRECTOR = "DIRECTOR";
    private static final String ROLE_CODE_CAST = "CAST";
    private static final String ROLE_CODE_CREW = "CREW";

    private static final double BASE_KEYWORD_WEIGHT_FACTOR = 0.60d;
    private static final double BASE_GENRE_WEIGHT_FACTOR = 0.30d;
    private static final double BASE_LANGUAGE_WEIGHT_FACTOR = 0.10d;

    private static final double BONUS_DIRECTOR_WEIGHT_FACTOR = 0.05d;
    private static final double BONUS_CAST_WEIGHT_FACTOR = 0.03d;
    private static final double BONUS_CREW_WEIGHT_FACTOR = 0.02d;
    private static final double BONUS_FILM_RATING_WEIGHT_FACTOR = 0.10d;

    private final WatchlistRepository watchlistRepository;
    private final RecommendationRepository recommendationRepository;
    private final FilmRepository filmRepository;
    private final UserCreditWeightRepository userCreditWeightRepository;
    private final UserGenreWeightRepository userGenreWeightRepository;
    private final UserKeywordWeightRepository userKeywordWeightRepository;
    private final UserLanguageWeightRepository userLanguageWeightRepository;

    @Value("${recommendation.scoring.new-release-days:365}")
    private int newReleaseDays;

    @Value("${recommendation.scoring.new-release-boost:0.5}")
    private double newReleaseBoost;

    @Transactional(readOnly = true)
    public List<RecommendationResultDTO> getRecommendationsForUser(User user) {
        if (user == null || user.getId() == null) {
            return List.of();
        }

        Watchlist watchlist = watchlistRepository.findByUserId(user.getId()).orElse(null);
        if (watchlist == null || watchlist.getItems() == null || watchlist.getItems().isEmpty()) {
            return List.of();
        }

        Set<Long> watchlistFilmInternalIds = watchlist.getItems().stream()
                .map(WatchlistItem::getFilm)
                .filter(Objects::nonNull)
                .map(Film::getInternalId)
                .filter(Objects::nonNull)
                .collect(java.util.stream.Collectors.toSet());
        if (watchlistFilmInternalIds.isEmpty()) {
            return List.of();
        }

        Set<Long> candidateFilmInternalIds = recommendationRepository.findRecommendedFilmIdsByFilmIds(watchlistFilmInternalIds);
        if (candidateFilmInternalIds == null || candidateFilmInternalIds.isEmpty()) {
            return List.of();
        }
        candidateFilmInternalIds.removeAll(watchlistFilmInternalIds);
        if (candidateFilmInternalIds.isEmpty()) {
            return List.of();
        }

        List<Film> fetchedCandidates = filmRepository.findAllByInternalIdIn(candidateFilmInternalIds);
        if (fetchedCandidates.isEmpty()) {
            return List.of();
        }

        Map<Long, Film> candidateByInternalId = new LinkedHashMap<>();
        for (Film candidate : fetchedCandidates) {
            if (candidate != null && candidate.getInternalId() != null) {
                candidateByInternalId.put(candidate.getInternalId(), candidate);
            }
        }
        if (candidateByInternalId.isEmpty()) {
            return List.of();
        }

        Map<String, Map<Long, Double>> creditWeightsByRole = buildCreditWeightMapByRole(user.getId());
        Map<Long, Double> directorWeights = creditWeightsByRole.getOrDefault(ROLE_CODE_DIRECTOR, Map.of());
        Map<Long, Double> castWeights = creditWeightsByRole.getOrDefault(ROLE_CODE_CAST, Map.of());
        Map<Long, Double> crewWeights = creditWeightsByRole.getOrDefault(ROLE_CODE_CREW, Map.of());
        Map<FilmType, Map<Long, Double>> genreWeights = buildGenreWeightMap(user.getId());
        Map<FilmType, Map<Long, Double>> keywordWeights = buildKeywordWeightMap(user.getId());
        Map<String, Double> languageWeights = buildLanguageWeightMap(user.getId());

        List<RawCandidateScore> rawScores = new ArrayList<>(candidateByInternalId.size());
        for (Film candidate : candidateByInternalId.values()) {
            rawScores.add(buildRawScore(candidate, directorWeights, castWeights, crewWeights, genreWeights, keywordWeights, languageWeights));
        }

        if (rawScores.isEmpty()) {
            return List.of();
        }

        MinMax keywordRange = minMax(rawScores.stream().map(RawCandidateScore::keywordRaw).toList());
        MinMax genreRange = minMax(rawScores.stream().map(RawCandidateScore::genreRaw).toList());
        MinMax languageRange = minMax(rawScores.stream().map(RawCandidateScore::languageRaw).toList());
        MinMax directorRange = minMax(rawScores.stream().map(RawCandidateScore::directorRaw).toList());
        MinMax castRange = minMax(rawScores.stream().map(RawCandidateScore::castRaw).toList());
        MinMax crewRange = minMax(rawScores.stream().map(RawCandidateScore::crewRaw).toList());
        MinMax ratingRange = minMax(rawScores.stream().map(RawCandidateScore::ratingRaw).toList());

        List<ScoredCandidate> scoredCandidates = new ArrayList<>(rawScores.size());
        for (RawCandidateScore raw : rawScores) {
            double keywordScore = normalizeToTen(raw.keywordRaw(), keywordRange.min(), keywordRange.max());
            double genreScore = normalizeToTen(raw.genreRaw(), genreRange.min(), genreRange.max());
            double languageScore = normalizeToTen(raw.languageRaw(), languageRange.min(), languageRange.max());
            double directorScore = normalizeToTen(raw.directorRaw(), directorRange.min(), directorRange.max());
            double castScore = normalizeToTen(raw.castRaw(), castRange.min(), castRange.max());
            double crewScore = normalizeToTen(raw.crewRaw(), crewRange.min(), crewRange.max());
            double ratingScore = normalizeToTen(raw.ratingRaw(), ratingRange.min(), ratingRange.max());
            double recencyBoostValue = computeRecencyBoost(raw.film().getDate());

            double baseScore =
                    (keywordScore * BASE_KEYWORD_WEIGHT_FACTOR)
                    + (genreScore * BASE_GENRE_WEIGHT_FACTOR)
                    + (languageScore * BASE_LANGUAGE_WEIGHT_FACTOR);

            double bonusScore =
                    (1 + ratingScore * BONUS_FILM_RATING_WEIGHT_FACTOR)
                            * (1 + castScore * BONUS_CAST_WEIGHT_FACTOR)
                            * (1 + crewScore * BONUS_CREW_WEIGHT_FACTOR)
                            * (1 + directorScore * BONUS_DIRECTOR_WEIGHT_FACTOR);

            double finalScore = baseScore * bonusScore + recencyBoostValue;

            scoredCandidates.add(new ScoredCandidate(
                    raw.film(),
                    finalScore,
                    keywordScore,
                    genreScore,
                    languageScore,
                    directorScore,
                    ratingScore,
                    recencyBoostValue
            ));
        }

        scoredCandidates.sort(Comparator
                .comparingDouble(ScoredCandidate::score).reversed()
                .thenComparing(candidate -> safeDouble(candidate.film().getRating()), Comparator.reverseOrder())
                .thenComparing(candidate -> candidate.film().getDate(), Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(candidate -> candidate.film().getInternalId(), Comparator.nullsLast(Comparator.naturalOrder())));

        return scoredCandidates.stream()
                .map(this::toDto)
                .toList();  
    }

    private RecommendationResultDTO toDto(ScoredCandidate scoredCandidate) {
        Film film = scoredCandidate.film();
        return new RecommendationResultDTO(
                film.getInternalId(),
                film.getFilmId(),
                film.getType(),
                film.getTitle(),
                film.getRating(),
                film.getDate(),
                film.getBackgroundImg(),
                scoredCandidate.score(),
                scoredCandidate.keywordScore(),
                scoredCandidate.genreScore(),
                scoredCandidate.languageScore(),
                scoredCandidate.directorScore(),
                scoredCandidate.ratingScore(),
                scoredCandidate.recencyBoost()
        );
    }

    private RawCandidateScore buildRawScore(
            Film film,
            Map<Long, Double> directorWeights,
            Map<Long, Double> castWeights,
            Map<Long, Double> crewWeights,
            Map<FilmType, Map<Long, Double>> genreWeights,
            Map<FilmType, Map<Long, Double>> keywordWeights,
            Map<String, Double> languageWeights
    ) {
        FilmType type = film.getType();
        Map<Long, Double> typeGenreWeights = type == null ? Map.of() : genreWeights.getOrDefault(type, Map.of());
        Map<Long, Double> typeKeywordWeights = type == null ? Map.of() : keywordWeights.getOrDefault(type, Map.of());

        double directorRaw = averageRoleWeight(film, ROLE_CODE_DIRECTOR, directorWeights);
        double castRaw = averageRoleWeight(film, ROLE_CODE_CAST, castWeights);
        double crewRaw = averageRoleWeight(film, ROLE_CODE_CREW, crewWeights);
        double genreRaw = averageWeight(
                film.getGenres().stream().map(g -> g.getGenreId()).filter(Objects::nonNull).toList(),
                typeGenreWeights
        );
        double keywordRaw = averageWeight(
                film.getKeywords().stream().map(k -> k.getKeywordId()).filter(Objects::nonNull).toList(),
                typeKeywordWeights
        );
        double languageRaw = resolveLanguageWeight(film, languageWeights);
        double ratingRaw = safeDouble(film.getRating());

        return new RawCandidateScore(film, keywordRaw, genreRaw, languageRaw, directorRaw, castRaw, crewRaw, ratingRaw);
    }

    private Map<String, Map<Long, Double>> buildCreditWeightMapByRole(Long userId) {
        Map<String, Map<Long, Double>> weightsByRole = new HashMap<>();
        for (UserCreditWeight weight : userCreditWeightRepository.findAllByUserReference_User_Id(userId)) {
            if (weight == null) {
                continue;
            }
            Long creditId = weight.getId() != null ? weight.getId().getCreditId() : null;
            String roleCode = weight.getRole() != null ? normalizeRoleCode(weight.getRole().getRoleCode()) : null;
            if (creditId == null || roleCode == null) {
                continue;
            }
            double value = safeLong(weight.getWeight());
            weightsByRole.computeIfAbsent(roleCode, ignored -> new HashMap<>())
                    .merge(creditId, value, (left, right) -> left + right);
        }
        return weightsByRole;
    }

    private Map<FilmType, Map<Long, Double>> buildGenreWeightMap(Long userId) {
        Map<FilmType, Map<Long, Double>> weightsByType = new HashMap<>();
        for (UserGenreWeight weight : userGenreWeightRepository.findAllByUserReference_User_Id(userId)) {
            if (weight == null) {
                continue;
            }
            FilmType type = weight.getType();
            Long genreId = weight.getId() != null ? weight.getId().getGenreId() : null;
            if (type == null || genreId == null) {
                continue;
            }
            double value = safeLong(weight.getWeight());
            weightsByType.computeIfAbsent(type, ignored -> new HashMap<>())
                    .merge(genreId, value, (left, right) -> left + right);
        }
        return weightsByType;
    }

    private Map<FilmType, Map<Long, Double>> buildKeywordWeightMap(Long userId) {
        Map<FilmType, Map<Long, Double>> weightsByType = new HashMap<>();
        for (UserKeywordWeight weight : userKeywordWeightRepository.findAllByUserReference_User_Id(userId)) {
            if (weight == null) {
                continue;
            }
            FilmType type = weight.getType();
            Long keywordId = weight.getId() != null ? weight.getId().getKeywordId() : null;
            if (type == null || keywordId == null) {
                continue;
            }
            double value = safeLong(weight.getWeight());
            weightsByType.computeIfAbsent(type, ignored -> new HashMap<>())
                    .merge(keywordId, value, (left, right) -> left + right);
        }
        return weightsByType;
    }

    private Map<String, Double> buildLanguageWeightMap(Long userId) {
        Map<String, Double> weights = new HashMap<>();
        for (UserLanguageWeight weight : userLanguageWeightRepository.findAllByUserReference_User_Id(userId)) {
            if (weight == null) {
                continue;
            }
            String languageCode = weight.getId() != null
                    ? normalizeLanguageCode(weight.getId().getLanguageCode())
                    : null;
            if (languageCode == null) {
                continue;
            }
            double value = safeLong(weight.getWeight());
            weights.merge(languageCode, value, (left, right) -> left + right);
        }
        return weights;
    }

    private double resolveLanguageWeight(Film film, Map<String, Double> languageWeights) {
        if (film == null || languageWeights == null || languageWeights.isEmpty()) {
            return 0.0d;
        }
        String languageCode = normalizeLanguageCode(film.getOriginalLanguage());
        if (languageCode == null) {
            return 0.0d;
        }
        return languageWeights.getOrDefault(languageCode, 0.0d);
    }

    private double averageRoleWeight(Film film, String roleCode, Map<Long, Double> weights) {
        if (film == null || roleCode == null || film.getFilmRoles() == null || film.getFilmRoles().isEmpty()) {
            return 0.0d;
        }

        List<Long> creditIds = film.getFilmRoles().stream()
                .filter(Objects::nonNull)
                .filter(filmRole -> hasRoleCode(filmRole, roleCode))
                .map(FilmRole::getCredit)
                .filter(Objects::nonNull)
                .map(credit -> credit.getCreditsId())
                .filter(Objects::nonNull)
                .distinct()
                .toList();

        return averageWeight(creditIds, weights);
    }

    private boolean hasRoleCode(FilmRole filmRole, String roleCode) {
        if (filmRole == null || filmRole.getRole() == null || roleCode == null) {
            return false;
        }
        String currentRoleCode = normalizeRoleCode(filmRole.getRole().getRoleCode());
        return roleCode.equals(currentRoleCode);
    }

    private double averageWeight(Collection<Long> ids, Map<Long, Double> weights) {
        if (ids == null || ids.isEmpty() || weights == null || weights.isEmpty()) {
            return 0.0d;
        }
        double sum = 0.0d;
        for (Long id : ids) {
            if (id == null) {
                continue;
            }
            Double value = weights.get(id);
            if (value == null) {
                continue;
            }
            sum += value;
        }
        return sum / (double) ids.size();
    }

    private double normalizeToTen(double value, double min, double max) {
        if (Double.compare(max, min) == 0) {
            return value > 0.0d ? 10.0d : 0.0d;
        }
        double normalized = ((value - min) / (max - min)) * 10.0d;
        return Math.max(0.0d, Math.min(10.0d, normalized));
    }

    private double computeRecencyBoost(LocalDate date) {
        if (date == null) {
            return 0.0d;
        }
        int windowDays = Math.max(1, newReleaseDays);
        double boost = Math.max(0.0d, newReleaseBoost);
        LocalDate threshold = LocalDate.now().minusDays(windowDays);
        return date.isBefore(threshold) ? 0.0d : boost;
    }

    private MinMax minMax(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return new MinMax(0.0d, 0.0d);
        }
        double min = Double.POSITIVE_INFINITY;
        double max = Double.NEGATIVE_INFINITY;
        for (Double value : values) {
            double safeValue = safeDouble(value);
            min = Math.min(min, safeValue);
            max = Math.max(max, safeValue);
        }
        if (Double.isInfinite(min) || Double.isInfinite(max)) {
            return new MinMax(0.0d, 0.0d);
        }
        return new MinMax(min, max);
    }

    private double safeLong(Long value) {
        return value == null ? 0.0d : value.doubleValue();
    }

    private double safeDouble(Double value) {
        return value == null ? 0.0d : value;
    }

    private String normalizeLanguageCode(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toLowerCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }

    private String normalizeRoleCode(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }

    private record RawCandidateScore(
            Film film,
            double keywordRaw,
            double genreRaw,
            double languageRaw,
            double directorRaw,
            double castRaw,
            double crewRaw,
            double ratingRaw
    ) {
    }

    private record MinMax(double min, double max) {
    }

    private record ScoredCandidate(
            Film film,
            double score,
            double keywordScore,
            double genreScore,
            double languageScore,
            double directorScore,
            double ratingScore,
            double recencyBoost
    ) {
    }
}
