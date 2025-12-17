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
    Page<Review> findByAnswerTo_Id(Long reviewId, Pageable pageable);
    Page<Review> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);
}
