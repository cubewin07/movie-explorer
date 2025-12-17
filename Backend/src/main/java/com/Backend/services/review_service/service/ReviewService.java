package com.Backend.services.review_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.model.ReviewsDTO;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public List<ReviewsDTO> getReviewsByFilmId(Long filmId, FilmType filmType, int page) {
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByFilmIdAndType(filmId, filmType, pageable);
        return reviews.stream().map(ReviewsDTO::fromReview).toList();
    }

    public List<ReviewsDTO> getRepliesByReviewId(Long reviewId) {
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByAnswerTo_Id(reviewId);
        return reviews.stream().map(ReviewsDTO::fromReview).toList();
    }
}
