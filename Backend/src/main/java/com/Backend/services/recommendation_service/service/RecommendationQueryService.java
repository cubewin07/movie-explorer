package com.Backend.services.recommendation_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.director_service.model.UserDirectorWeight;
import com.Backend.services.director_service.repository.UserDirectorWeightRepository;
import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.repository.UserGenreWeightRepository;
import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.repository.UserKeywordWeightRepository;
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

    private static final double KEYWORD_WEIGHT_FACTOR = 0.40d;
    private static final double GENRE_WEIGHT_FACTOR = 0.30d;
    private static final double DIRECTOR_WEIGHT_FACTOR = 0.15d;
    private static final double FILM_RATING_WEIGHT_FACTOR = 0.15d;

    private final WatchlistRepository watchlistRepository;
    private final RecommendationRepository recommendationRepository;
    private final FilmRepository filmRepository;
    private final UserDirectorWeightRepository userDirectorWeightRepository;
    private final UserGenreWeightRepository userGenreWeightRepository;
    private final UserKeywordWeightRepository userKeywordWeightRepository;

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

        Map<Long, Double> directorWeights = buildDirectorWeightMap(user.getId());
        Map<FilmType, Map<Long, Double>> genreWeights = buildGenreWeightMap(user.getId());
        Map<FilmType, Map<Long, Double>> keywordWeights = buildKeywordWeightMap(user.getId());

        List<RawCandidateScore> rawScores = new ArrayList<>(candidateByInternalId.size());
        for (Film candidate : candidateByInternalId.values()) {
            rawScores.add(buildRawScore(candidate, directorWeights, genreWeights, keywordWeights));
        }

        if (rawScores.isEmpty()) {
            return List.of();
        }

        MinMax keywordRange = minMax(rawScores.stream().map(RawCandidateScore::keywordRaw).toList());
        MinMax genreRange = minMax(rawScores.stream().map(RawCandidateScore::genreRaw).toList());
        MinMax directorRange = minMax(rawScores.stream().map(RawCandidateScore::directorRaw).toList());
        MinMax ratingRange = minMax(rawScores.stream().map(RawCandidateScore::ratingRaw).toList());

        List<ScoredCandidate> scoredCandidates = new ArrayList<>(rawScores.size());
        for (RawCandidateScore raw : rawScores) {
            double keywordScore = normalizeToTen(raw.keywordRaw(), keywordRange.min(), keywordRange.max());
            double genreScore = normalizeToTen(raw.genreRaw(), genreRange.min(), genreRange.max());
            double directorScore = normalizeToTen(raw.directorRaw(), directorRange.min(), directorRange.max());
            double ratingScore = normalizeToTen(raw.ratingRaw(), ratingRange.min(), ratingRange.max());
            double recencyBoostValue = computeRecencyBoost(raw.film().getDate());

            double finalScore =
                    (keywordScore * KEYWORD_WEIGHT_FACTOR)
                    + (genreScore * GENRE_WEIGHT_FACTOR)
                    + (directorScore * DIRECTOR_WEIGHT_FACTOR)
                    + (ratingScore * FILM_RATING_WEIGHT_FACTOR)
                    + recencyBoostValue;

            scoredCandidates.add(new ScoredCandidate(
                    raw.film(),
                    finalScore,
                    keywordScore,
                    genreScore,
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
                scoredCandidate.directorScore(),
                scoredCandidate.ratingScore(),
                scoredCandidate.recencyBoost()
        );
    }

    private RawCandidateScore buildRawScore(
            Film film,
            Map<Long, Double> directorWeights,
            Map<FilmType, Map<Long, Double>> genreWeights,
            Map<FilmType, Map<Long, Double>> keywordWeights
    ) {
        FilmType type = film.getType();
        Map<Long, Double> typeGenreWeights = type == null ? Map.of() : genreWeights.getOrDefault(type, Map.of());
        Map<Long, Double> typeKeywordWeights = type == null ? Map.of() : keywordWeights.getOrDefault(type, Map.of());

        double directorRaw = averageWeight(
                film.getDirectors().stream().map(d -> d.getDirectorId()).filter(Objects::nonNull).toList(),
                directorWeights
        );
        double genreRaw = averageWeight(
                film.getGenres().stream().map(g -> g.getGenreId()).filter(Objects::nonNull).toList(),
                typeGenreWeights
        );
        double keywordRaw = averageWeight(
                film.getKeywords().stream().map(k -> k.getKeywordId()).filter(Objects::nonNull).toList(),
                typeKeywordWeights
        );
        double ratingRaw = safeDouble(film.getRating());

        return new RawCandidateScore(film, keywordRaw, genreRaw, directorRaw, ratingRaw);
    }

    private Map<Long, Double> buildDirectorWeightMap(Long userId) {
        Map<Long, Double> weights = new HashMap<>();
        for (UserDirectorWeight weight : userDirectorWeightRepository.findAllByUserReference_User_Id(userId)) {
            if (weight == null) {
                continue;
            }
            Long directorId = weight.getId() != null ? weight.getId().getDirectorId() : null;
            if (directorId == null) {
                continue;
            }
            double value = safeLong(weight.getWeight());
            weights.merge(directorId, value, (left, right) -> left + right);
        }
        return weights;
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

    private record RawCandidateScore(
            Film film,
            double keywordRaw,
            double genreRaw,
            double directorRaw,
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
            double directorScore,
            double ratingScore,
            double recencyBoost
    ) {
    }
}
