package com.Backend.services.recommendation_service.snapshot.service;

import com.Backend.services.film_service.model.Film;
import com.Backend.services.film_service.repository.FilmRepository;
import com.Backend.services.recommendation_service.snapshot.model.UserRecommendationSnapshotRow;
import com.Backend.services.recommendation_service.snapshot.model.UserRecommendationSnapshotState;
import com.Backend.services.recommendation_service.snapshot.repository.RecommendationFeatureRepository;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecommendationSnapshotRowRepository;
import com.Backend.services.recommendation_service.snapshot.repository.UserRecommendationSnapshotStateRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class RecommendationSnapshotRecomputeService {

    private static final String ROLE_CODE_DIRECTOR = "DIRECTOR";
    private static final String ROLE_CODE_CAST = "CAST";
    private static final String ROLE_CODE_CREW = "CREW";

    private static final double BASE_KEYWORD_WEIGHT_FACTOR = 0.60d;
    private static final double BASE_GENRE_WEIGHT_FACTOR = 0.30d;
    private static final double BASE_LANGUAGE_WEIGHT_FACTOR = 0.10d;

    private static final double BONUS_DIRECTOR_WEIGHT_FACTOR = 0.05d;
    private static final double BONUS_CAST_WEIGHT_FACTOR = 0.05d;
    private static final double BONUS_CREW_WEIGHT_FACTOR = 0.02d;
    private static final double BONUS_FILM_RATING_WEIGHT_FACTOR = 0.10d;

    private final CandidatePassFilter candidatePassFilter;
    private final FilmRepository filmRepository;
    private final RecommendationFeatureRepository featureRepository;
    private final UserRecommendationSnapshotStateRepository stateRepository;
    private final UserRecommendationSnapshotRowRepository rowRepository;

    @Value("${recommendation.query.max-results:40}")
    private int maxResults;

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void recomputeSnapshotForUser(Long userId) {
        if (userId == null) {
            return;
        }

        long uid = userId;

        UserRecommendationSnapshotState lockedState = stateRepository.findByUserIdForUpdate(uid);
        long currentVersion = lockedState != null ? lockedState.getActiveVersion() : 0L;
        long newVersion = currentVersion + 1L;

        List<Long> watchlistFilmIds = candidatePassFilter.resolveWatchlistFilmIds(uid);
        if (watchlistFilmIds.isEmpty()) {
            writeSnapshot(uid, newVersion, List.of());
            return;
        }

        Set<Long> candidateIds = candidatePassFilter.resolveCandidateFilmIds(watchlistFilmIds);
        if (candidateIds.isEmpty()) {
            writeSnapshot(uid, newVersion, List.of());
            return;
        }

        // Pass-1: select top-k enriched candidates via cheap heuristic.
        List<Long> pass2Survivors = candidatePassFilter.pickEnrichedSurvivors(watchlistFilmIds, candidateIds);
        if (pass2Survivors.isEmpty()) {
            writeSnapshot(uid, newVersion, List.of());
            return;
        }

        // Pass-2: full feature scoring.
        WatchlistFeatures watchlistFeatures = buildWatchlistFeatures(watchlistFilmIds);
        CandidateFeatures candidateFeatures = buildCandidateFeatures(pass2Survivors);

        List<Film> candidates = filmRepository.findAllByInternalIdIn(pass2Survivors);
        Map<Long, Film> candidateById = new LinkedHashMap<>();
        for (Film film : candidates) {
            if (film != null && film.getInternalId() != null) {
                candidateById.put(film.getInternalId(), film);
            }
        }

        List<RawCandidateScore> rawScores = new ArrayList<>(candidateById.size());
        for (Film candidate : candidateById.values()) {
            rawScores.add(buildRawScore(candidate, watchlistFeatures, candidateFeatures));
        }

        if (rawScores.isEmpty()) {
            writeSnapshot(uid, newVersion, List.of());
            return;
        }

        MinMax keywordRange  = minMax(rawScores.stream().map(RawCandidateScore::keywordRaw).toList());
        MinMax genreRange    = minMax(rawScores.stream().map(RawCandidateScore::genreRaw).toList());
        MinMax languageRange = minMax(rawScores.stream().map(RawCandidateScore::languageRaw).toList());
        MinMax directorRange = minMax(rawScores.stream().map(RawCandidateScore::directorRaw).toList());
        MinMax castRange     = minMax(rawScores.stream().map(RawCandidateScore::castRaw).toList());
        MinMax crewRange     = minMax(rawScores.stream().map(RawCandidateScore::crewRaw).toList());
        MinMax ratingRange   = minMax(rawScores.stream().map(RawCandidateScore::ratingRaw).toList());

        List<ScoredCandidate> scored = new ArrayList<>(rawScores.size());
        for (RawCandidateScore raw : rawScores) {
            double keywordScore  = normalizeToTen(raw.keywordRaw(),  keywordRange.min(),  keywordRange.max());
            double genreScore    = normalizeToTen(raw.genreRaw(),    genreRange.min(),    genreRange.max());
            double languageScore = normalizeToTen(raw.languageRaw(), languageRange.min(), languageRange.max());
            double directorScore = normalizeToTen(raw.directorRaw(), directorRange.min(), directorRange.max());
            double castScore     = normalizeToTen(raw.castRaw(),     castRange.min(),     castRange.max());
            double crewScore     = normalizeToTen(raw.crewRaw(),     crewRange.min(),     crewRange.max());
            double ratingScore   = normalizeToTen(raw.ratingRaw(),   ratingRange.min(),   ratingRange.max());
            double recencyBoost  = candidatePassFilter.computeRecencyBoost(raw.film().getDate());

            double baseScore =
                    (keywordScore  * BASE_KEYWORD_WEIGHT_FACTOR)
                  + (genreScore    * BASE_GENRE_WEIGHT_FACTOR)
                  + (languageScore * BASE_LANGUAGE_WEIGHT_FACTOR);

            double bonusScore =
                    (1 + ratingScore   * BONUS_FILM_RATING_WEIGHT_FACTOR)
                  * (1 + castScore     * BONUS_CAST_WEIGHT_FACTOR)
                  * (1 + crewScore     * BONUS_CREW_WEIGHT_FACTOR)
                  * (1 + directorScore * BONUS_DIRECTOR_WEIGHT_FACTOR);

            double finalScore = baseScore * bonusScore + recencyBoost;

            scored.add(new ScoredCandidate(
                    raw.film(), finalScore,
                    keywordScore, genreScore, languageScore,
                    directorScore, ratingScore, recencyBoost));
        }

        scored.sort(Comparator
                .comparingDouble(ScoredCandidate::score).reversed()
                .thenComparing(c -> candidatePassFilter.safeDouble(c.film().getRating()), Comparator.reverseOrder())
                .thenComparing(c -> c.film().getDate(), Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(c -> c.film().getInternalId(), Comparator.nullsLast(Comparator.naturalOrder())));

        int limit = Math.max(0, maxResults);
        List<ScoredCandidate> top = limit > 0 ? scored.stream().limit(limit).toList() : scored;

        List<UserRecommendationSnapshotRow> rows = new ArrayList<>(top.size());
        int rank = 1;
        for (ScoredCandidate candidate : top) {
            Film film = candidate.film();
            if (film == null || film.getInternalId() == null || film.getFilmId() == null || film.getType() == null) {
                continue;
            }
            rows.add(UserRecommendationSnapshotRow.builder()
                    .userId(uid)
                    .snapshotVersion(newVersion)
                    .rank(rank++)
                    .filmInternalId(film.getInternalId())
                    .tmdbId(film.getFilmId())
                    .type(film.getType())
                    .title(film.getTitle())
                    .rating(film.getRating())
                    .date(film.getDate())
                    .backgroundImg(film.getBackgroundImg())
                    .score(candidate.score())
                    .keywordScore(candidate.keywordScore())
                    .genreScore(candidate.genreScore())
                    .languageScore(candidate.languageScore())
                    .directorScore(candidate.directorScore())
                    .ratingScore(candidate.ratingScore())
                    .recencyBoost(candidate.recencyBoost())
                    .build());
        }

        writeSnapshot(uid, newVersion, rows);

        log.debug(
                "Recomputed user recommendation snapshot userId={} version={} rows={}",
                uid, newVersion, rows.size());
    }

    // -------------------------------------------------------------------------
    // Feature builders (full scoring — pass-2)
    // -------------------------------------------------------------------------

    private WatchlistFeatures buildWatchlistFeatures(List<Long> watchlistFilmIds) {
        Set<String> languages    = new HashSet<>();
        Set<Long> genreIds       = new HashSet<>();
        Set<Long> keywordIds     = new HashSet<>();
        Set<Long> directorCredits = new HashSet<>();
        Set<Long> castCredits    = new HashSet<>();
        Set<Long> crewCredits    = new HashSet<>();

        // Languages come from the film entities directly (shared helper).
        List<Film> watchlistFilms = filmRepository.findAllById(watchlistFilmIds);
        for (Film film : watchlistFilms) {
            if (film == null) continue;
            String lang = candidatePassFilter.normalizeLanguage(film.getOriginalLanguage());
            if (lang != null) languages.add(lang);
        }

        for (RecommendationFeatureRepository.FilmGenreLink link : featureRepository.findFilmGenres(watchlistFilmIds)) {
            if (link != null && link.getGenreId() != null) {
                genreIds.add(link.getGenreId());
            }
        }

        for (RecommendationFeatureRepository.FilmKeywordLink link : featureRepository.findFilmKeywords(watchlistFilmIds)) {
            if (link != null && link.getKeywordId() != null) {
                keywordIds.add(link.getKeywordId());
            }
        }

        for (RecommendationFeatureRepository.FilmCreditLink link : featureRepository.findFilmCredits(watchlistFilmIds)) {
            if (link == null || link.getCreditId() == null) continue;
            String role = normalizeRole(link.getRoleCode());
            if (ROLE_CODE_DIRECTOR.equals(role))      directorCredits.add(link.getCreditId());
            else if (ROLE_CODE_CAST.equals(role))     castCredits.add(link.getCreditId());
            else if (ROLE_CODE_CREW.equals(role))     crewCredits.add(link.getCreditId());
        }

        return new WatchlistFeatures(languages, genreIds, keywordIds, directorCredits, castCredits, crewCredits);
    }

    private CandidateFeatures buildCandidateFeatures(List<Long> candidateFilmIds) {
        Map<Long, Set<Long>> genresByFilm   = new HashMap<>();
        Map<Long, Set<Long>> keywordsByFilm = new HashMap<>();
        Map<Long, Set<Long>> directorByFilm = new HashMap<>();
        Map<Long, Set<Long>> castByFilm     = new HashMap<>();
        Map<Long, Set<Long>> crewByFilm     = new HashMap<>();

        for (Long id : candidateFilmIds) {
            if (id == null) continue;
            genresByFilm.put(id, new HashSet<>());
            keywordsByFilm.put(id, new HashSet<>());
        }

        for (RecommendationFeatureRepository.FilmGenreLink link : featureRepository.findFilmGenres(candidateFilmIds)) {
            if (link == null || link.getInternalFilmId() == null || link.getGenreId() == null) continue;
            genresByFilm.computeIfAbsent(link.getInternalFilmId(), i -> new HashSet<>()).add(link.getGenreId());
        }

        for (RecommendationFeatureRepository.FilmKeywordLink link : featureRepository.findFilmKeywords(candidateFilmIds)) {
            if (link == null || link.getInternalFilmId() == null || link.getKeywordId() == null) continue;
            keywordsByFilm.computeIfAbsent(link.getInternalFilmId(), i -> new HashSet<>()).add(link.getKeywordId());
        }

        for (RecommendationFeatureRepository.FilmCreditLink link : featureRepository.findFilmCredits(candidateFilmIds)) {
            if (link == null || link.getInternalFilmId() == null || link.getCreditId() == null) continue;
            String role = normalizeRole(link.getRoleCode());
            if (ROLE_CODE_DIRECTOR.equals(role)) {
                directorByFilm.computeIfAbsent(link.getInternalFilmId(), i -> new HashSet<>()).add(link.getCreditId());
            } else if (ROLE_CODE_CAST.equals(role)) {
                castByFilm.computeIfAbsent(link.getInternalFilmId(), i -> new HashSet<>()).add(link.getCreditId());
            } else if (ROLE_CODE_CREW.equals(role)) {
                crewByFilm.computeIfAbsent(link.getInternalFilmId(), i -> new HashSet<>()).add(link.getCreditId());
            }
        }

        Map<String, Map<Long, Set<Long>>> creditsByRole = new HashMap<>();
        creditsByRole.put(ROLE_CODE_DIRECTOR, directorByFilm);
        creditsByRole.put(ROLE_CODE_CAST,     castByFilm);
        creditsByRole.put(ROLE_CODE_CREW,     crewByFilm);

        return new CandidateFeatures(genresByFilm, keywordsByFilm, creditsByRole);
    }

    private RawCandidateScore buildRawScore(Film candidate, WatchlistFeatures watchlist, CandidateFeatures features) {
        Long id = candidate.getInternalId();

        Set<Long> genres    = features.genresByFilm().getOrDefault(id, Set.of());
        Set<Long> keywords  = features.keywordsByFilm().getOrDefault(id, Set.of());
        Set<Long> directors = features.creditsByRole().getOrDefault(ROLE_CODE_DIRECTOR, Map.of()).getOrDefault(id, Set.of());
        Set<Long> cast      = features.creditsByRole().getOrDefault(ROLE_CODE_CAST,     Map.of()).getOrDefault(id, Set.of());
        Set<Long> crew      = features.creditsByRole().getOrDefault(ROLE_CODE_CREW,     Map.of()).getOrDefault(id, Set.of());

        double keywordRaw  = overlapCount(keywords,  watchlist.keywordIds());
        double genreRaw    = overlapCount(genres,    watchlist.genreIds());
        double languageRaw = watchlist.languages().contains(candidatePassFilter.normalizeLanguage(candidate.getOriginalLanguage())) ? 1.0d : 0.0d;
        double directorRaw = overlapCount(directors, watchlist.directorCredits());
        double castRaw     = overlapCount(cast,      watchlist.castCredits());
        double crewRaw     = overlapCount(crew,      watchlist.crewCredits());
        double ratingRaw   = candidatePassFilter.safeDouble(candidate.getRating());

        return new RawCandidateScore(candidate, keywordRaw, genreRaw, languageRaw, directorRaw, castRaw, crewRaw, ratingRaw);
    }

    // -------------------------------------------------------------------------
    // Snapshot persistence
    // -------------------------------------------------------------------------

    private void writeSnapshot(long userId, long newVersion, List<UserRecommendationSnapshotRow> rows) {
        rowRepository.deleteAllByUserIdAndSnapshotVersion(userId, newVersion);
        if (rows != null && !rows.isEmpty()) {
            rowRepository.saveAll(rows);
        }

        UserRecommendationSnapshotState state = stateRepository.findById(userId)
                .orElseGet(() -> UserRecommendationSnapshotState.builder()
                        .userId(userId).activeVersion(0L).build());
        state.setActiveVersion(newVersion);
        stateRepository.save(state);

        rowRepository.deleteAllByUserIdAndSnapshotVersionLessThan(userId, newVersion);
    }

    // -------------------------------------------------------------------------
    // Scoring helpers
    // -------------------------------------------------------------------------

    private double overlapCount(Set<Long> candidateIds, Set<Long> watchlistIds) {
        if (candidateIds == null || candidateIds.isEmpty() || watchlistIds == null || watchlistIds.isEmpty()) {
            return 0.0d;
        }
        double count = 0.0d;
        for (Long id : candidateIds) {
            if (id != null && watchlistIds.contains(id)) {
                count += 1.0d;
            }
        }
        return count;
    }

    private double normalizeToTen(double value, double min, double max) {
        if (Double.compare(max, min) == 0) {
            return value > 0.0d ? 10.0d : 0.0d;
        }
        double normalized = ((value - min) / (max - min)) * 10.0d;
        return Math.max(0.0d, Math.min(10.0d, normalized));
    }

    private MinMax minMax(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return new MinMax(0.0d, 0.0d);
        }
        double min = Double.POSITIVE_INFINITY;
        double max = Double.NEGATIVE_INFINITY;
        for (Double v : values) {
            double safe = candidatePassFilter.safeDouble(v);
            min = Math.min(min, safe);
            max = Math.max(max, safe);
        }
        if (Double.isInfinite(min) || Double.isInfinite(max)) {
            return new MinMax(0.0d, 0.0d);
        }
        return new MinMax(min, max);
    }

    private String normalizeRole(String value) {
        if (value == null) {
            return null;
        }
        String normalized = value.trim().toUpperCase(Locale.ROOT);
        return normalized.isEmpty() ? null : normalized;
    }

    // -------------------------------------------------------------------------
    // Internal records
    // -------------------------------------------------------------------------

    private record WatchlistFeatures(
            Set<String> languages,
            Set<Long> genreIds,
            Set<Long> keywordIds,
            Set<Long> directorCredits,
            Set<Long> castCredits,
            Set<Long> crewCredits
    ) {}

    private record CandidateFeatures(
            Map<Long, Set<Long>> genresByFilm,
            Map<Long, Set<Long>> keywordsByFilm,
            Map<String, Map<Long, Set<Long>>> creditsByRole
    ) {}

    private record RawCandidateScore(
            Film film,
            double keywordRaw,
            double genreRaw,
            double languageRaw,
            double directorRaw,
            double castRaw,
            double crewRaw,
            double ratingRaw
    ) {}

    private record MinMax(double min, double max) {}

    private record ScoredCandidate(
            Film film,
            double score,
            double keywordScore,
            double genreScore,
            double languageScore,
            double directorScore,
            double ratingScore,
            double recencyBoost
    ) {}
}
