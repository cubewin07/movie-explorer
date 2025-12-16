package com.Backend.services.review_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public void getReviewsByFilmId(Long filmId, FilmType filmType, User user, int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByFilmIdAndType(filmId, filmType, pageable);
    }
}
