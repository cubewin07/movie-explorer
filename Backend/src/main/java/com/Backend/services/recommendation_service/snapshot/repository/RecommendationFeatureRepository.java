package com.Backend.services.recommendation_service.snapshot.repository;

import com.Backend.services.film_service.model.Film;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

public interface RecommendationFeatureRepository extends Repository<Film, Long> {

    @Query(
        value = "select fg.internal_film_id as internalFilmId, fg.genre_id as genreId "
            + "from film_genre fg "
            + "where fg.internal_film_id in (:filmInternalIds)",
        nativeQuery = true
    )
    List<FilmGenreLink> findFilmGenres(@Param("filmInternalIds") Collection<Long> filmInternalIds);

    @Query(
        value = "select fk.internal_film_id as internalFilmId, fk.keyword_id as keywordId "
            + "from film_keyword fk "
            + "where fk.internal_film_id in (:filmInternalIds)",
        nativeQuery = true
    )
    List<FilmKeywordLink> findFilmKeywords(@Param("filmInternalIds") Collection<Long> filmInternalIds);

    @Query(
        value = "select fr.film_id as internalFilmId, fr.credit_id as creditId, upper(r.role_code) as roleCode "
            + "from film_role fr "
            + "join role r on r.role_id = fr.role_id "
            + "where fr.film_id in (:filmInternalIds) "
            + "and upper(r.role_code) in ('DIRECTOR','CAST','CREW')",
        nativeQuery = true
    )
    List<FilmCreditLink> findFilmCredits(@Param("filmInternalIds") Collection<Long> filmInternalIds);

    interface FilmGenreLink {
        Long getInternalFilmId();

        Long getGenreId();
    }

    interface FilmKeywordLink {
        Long getInternalFilmId();

        Long getKeywordId();
    }

    interface FilmCreditLink {
        Long getInternalFilmId();

        Long getCreditId();

        String getRoleCode();
    }
}
