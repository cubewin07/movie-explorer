package com.Backend.services.review_service.repository;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.Review;
import com.Backend.services.user_service.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByFilmIdAndType(Long filmId, FilmType filmType, Pageable pageable);

    long countByFilmIdAndType(Long filmId, FilmType filmType);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumber(
            Long filmId, FilmType type, Integer seasonNumber, Integer episodeNumber, Pageable pageable);

    long countByFilmIdAndTypeAndSeasonNumberAndEpisodeNumber(
            Long filmId, FilmType type, Integer seasonNumber, Integer episodeNumber);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumberIsNull(
            Long filmId, FilmType type, Pageable pageable);

    long countByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumberIsNull(
            Long filmId, FilmType type);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumberIsNull(
            Long filmId, FilmType type, Integer seasonNumber, Pageable pageable);

    long countByFilmIdAndTypeAndSeasonNumberAndEpisodeNumberIsNull(
            Long filmId, FilmType type, Integer seasonNumber);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumber(
            Long filmId, FilmType type, Integer episodeNumber, Pageable pageable);

    long countByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumber(
            Long filmId, FilmType type, Integer episodeNumber);

        Page<Review> findByFilmIdAndTypeAndSeasonNumber(
            Long filmId, FilmType type, Integer seasonNumber, Pageable pageable);

        long countByFilmIdAndTypeAndSeasonNumber(
            Long filmId, FilmType type, Integer seasonNumber);
        

    Page<Review> findByAnswerTo_Id(Long reviewId, Pageable pageable);
    long countByAnswerTo_Id(Long reviewId);
    Page<Review> findByUser(User user, Pageable pageable);
}
