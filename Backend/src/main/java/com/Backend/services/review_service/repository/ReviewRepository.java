package com.Backend.services.review_service.repository;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.Review;
import com.Backend.services.user_service.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByFilmIdAndType(Long filmId, FilmType filmType, Pageable pageable);

    List<Review> findByFilmIdAndType(Long filmId, FilmType filmType);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumber(
            Long filmId, FilmType type, Integer seasonNumber, Integer episodeNumber, Pageable pageable);

    List<Review> findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumber(
            Long filmId, FilmType type, Integer seasonNumber, Integer episodeNumber);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumberIsNull(
            Long filmId, FilmType type, Pageable pageable);

    List<Review> findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumberIsNull(
            Long filmId, FilmType type);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumberIsNull(
            Long filmId, FilmType type, Integer seasonNumber, Pageable pageable);

    List<Review> findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumberIsNull(
            Long filmId, FilmType type, Integer seasonNumber);

    Page<Review> findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumber(
            Long filmId, FilmType type, Integer episodeNumber, Pageable pageable);

    List<Review> findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumber(
            Long filmId, FilmType type, Integer episodeNumber);

    Page<Review> findByAnswerTo_Id(Long reviewId, Pageable pageable);
    long countByAnswerTo_Id(Long reviewId);
    Page<Review> findByUser(User user, Pageable pageable);
}
