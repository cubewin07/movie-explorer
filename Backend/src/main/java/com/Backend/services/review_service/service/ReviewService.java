package com.Backend.services.review_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.CreateReplyRequest;
import com.Backend.services.review_service.model.CreateReviewRequest;
import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.model.ReviewsDTO;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewRepository reviewRepository;

    public List<ReviewsDTO> getReviewsByFilmId(Long filmId, FilmType filmType, int page) {
        log.info("Fetching reviews for filmId={}, type={}, page={}", filmId, filmType, page);
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByFilmIdAndType(filmId, filmType, pageable);
        log.debug("Fetched {} reviews for filmId={}, type={}, page={}", reviews.getNumberOfElements(), filmId, filmType, page);
        return reviews.stream().map(ReviewsDTO::fromReview).toList();
    }

    public List<ReviewsDTO> getRepliesByReviewId(Long reviewId) {
        log.info("Fetching replies for reviewId={}", reviewId);
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByAnswerTo_Id(reviewId, pageable);
        log.debug("Fetched {} replies for reviewId={}", reviews.getNumberOfElements(), reviewId);
        return reviews.stream().map(ReviewsDTO::fromReview).toList();
    }

    public List<ReviewsDTO> getReviewsByUser(User user, int page) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Fetching reviews by userId={}, page={}", userId, page);
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        Page<Review> review = reviewRepository.findByUser(user, pageable);
        log.debug("Fetched {} reviews for userId={}, page={}", review.getNumberOfElements(), userId, page);
        return review.stream().map(ReviewsDTO::fromReview).toList();
    }

    @Transactional
    public ReviewsDTO createReview(CreateReviewRequest request, User user) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Creating review for filmId={}, type={}, userId={}", request.getFilmId(), request.getType(), userId);
        Review review = Review.builder()
                .user(user)
                .filmId(request.getFilmId())
                .type(request.getType())
                .content(request.getContent())
                .build();
        reviewRepository.save(review);
        log.info("Created review id={} for filmId={} by userId={}", review.getId(), request.getFilmId(), userId);
        return ReviewsDTO.fromReview(review);
    }

    @Transactional
    public ReviewsDTO createReply(CreateReplyRequest request, User user) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Creating reply to reviewId={} by userId={}", request.getReplyToId(), userId);
        Review parent = reviewRepository.findById(request.getReplyToId()).orElseThrow();
        Review reply = Review.builder()
                .user(user)
                .filmId(parent.getFilmId())
                .type(parent.getType())
                .content(request.getContent())
                .answerTo(parent)
                .build();
        reviewRepository.save(reply);
        log.info("Created reply id={} to parentReviewId={} by userId={}", reply.getId(), parent.getId(), userId);
        return ReviewsDTO.fromReview(reply);
    }

    @Transactional
    public void deleteReview(Long reviewId, User user) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Deleting reviewId={} by userId={}", reviewId, userId);
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        if (!review.getUser().equals(user)) {
            log.warn("UserId={} attempted to delete reviewId={} which belongs to userId={}", userId, reviewId, review.getUser() != null ? review.getUser().getId() : null);
            throw new IllegalArgumentException("Review does not belong to user");
        }
        reviewRepository.delete(review);
        log.info("Deleted reviewId={} by userId={}", reviewId, userId);
    }
}
