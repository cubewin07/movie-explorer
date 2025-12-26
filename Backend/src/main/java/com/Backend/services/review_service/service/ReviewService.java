package com.Backend.services.review_service.service;

import com.Backend.services.FilmType;
import com.Backend.services.review_service.model.*;
import com.Backend.services.review_service.model.vote.SimpleVoteDTO;
import com.Backend.services.review_service.model.vote.Vote;
import com.Backend.services.review_service.model.vote.VoteRepository;
import com.Backend.services.review_service.model.vote.VoteService;
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
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Caching;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final VoteRepository voteRepository;
    private final VoteService voteService;

    @Cacheable(value = "filmReviews", key = "{#filmId, #filmType, #seasonNumber, #episodeNumber, #page, (#user != null ? #user.id : 0)}")
    public List<ReviewsDTO> getReviewsByFilmId(Long filmId, FilmType filmType, Integer seasonNumber, Integer episodeNumber, int page, User user) {
        log.info("Fetching reviews for filmId={}, type={}, season={}, episode={}, page={}", filmId, filmType, seasonNumber, episodeNumber, page);
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());

        Page<Review> reviews;
        if (seasonNumber != null && episodeNumber != null) {
            reviews = reviewRepository.findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumber(filmId, filmType, seasonNumber, episodeNumber, pageable);
        } else if (seasonNumber != null && episodeNumber == null) {
            reviews = reviewRepository.findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumberIsNull(filmId, filmType, seasonNumber, pageable);
        } else if (seasonNumber == null && episodeNumber != null) {
            reviews = reviewRepository.findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumber(filmId, filmType, episodeNumber, pageable);
        } else {
            reviews = reviewRepository.findByFilmIdAndType(filmId, filmType, pageable);
        }

        log.debug("Fetched {} reviews for filmId={}, type={}, page={}", reviews.getNumberOfElements(), filmId, filmType, page);

        // Vote default to false when the user is unauthenticated
        if(user == null)
            return new ArrayList<>(reviews.stream().map(r -> ReviewsDTO.fromReview(r, false, false)).toList());

        return handleVoteForReviewsDTO(reviews.getContent(), user);
    }

    @Cacheable(value = "reviewReplies", key = "{#reviewId, (#user != null ? #user.id : 0)}")
    public List<ReviewsDTO> getRepliesByReviewId(Long reviewId, User user) {
        log.info("Fetching replies for reviewId={}", reviewId);
        Pageable pageable = PageRequest.of(0, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByAnswerTo_Id(reviewId, pageable);
        log.debug("Fetched {} replies for reviewId={}", reviews.getNumberOfElements(), reviewId);

        // Vote default to false when the user is unauthenticated
        if(user == null)
            return new ArrayList<>(reviews.stream().map(r -> ReviewsDTO.fromReview(r, false, false)).toList());

        return handleVoteForReviewsDTO(reviews.getContent(), user);
    }

    @Cacheable(value = "userReviews", key = "{ (#user != null ? #user.id : 0), #page }")
    public List<ReviewsDTO> getReviewsByUser(User user, int page) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Fetching reviews by userId={}, page={}", userId, page);
        Pageable pageable = PageRequest.of(page, 20, Sort.by("createdAt").descending());
        Page<Review> reviews = reviewRepository.findByUser(user, pageable);
        log.debug("Fetched {} reviews for userId={}, page={}", reviews.getNumberOfElements(), userId, page);

        return handleVoteForReviewsDTO(reviews.getContent(), user);
    }

    @Caching(evict = {
            @CacheEvict(value = "filmReviews", allEntries = true),
            @CacheEvict(value = "userReviews", allEntries = true),
            @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    @Transactional
    public ReviewsDTO createReview(CreateReviewRequest request, User user) {
        EpisodeMetadata metadata = request.getEpisodeMetadata();

        Integer episodeSeasonNumber = null;
        Integer episodeNumber = null;

        if (metadata != null) {
            episodeSeasonNumber = metadata.getSeasonNumber();
            episodeNumber = metadata.getEpisodeNumber();
        }

        if (request.getType() == FilmType.SERIES) {
            // For series, allow any combination: both null, season only, episode only, or both provided
            // No validation needed - all combinations are valid
        } else if (request.getType() == FilmType.MOVIE) {
            if (episodeSeasonNumber != null || episodeNumber != null) {
                throw new IllegalArgumentException("For MOVIE, seasonNumber and episodeNumber must be null.");
            }
        }

        Long userId = (user != null) ? user.getId() : null;
        log.info("Creating review for filmId={}, type={}, userId={}", request.getFilmId(), request.getType(), userId);
        Review review = Review.builder()
                .user(user)
                .filmId(request.getFilmId())
                .type(request.getType())
                .content(request.getContent())
                .seasonNumber(episodeSeasonNumber)
                .episodeNumber(episodeNumber)
                .score(1L)
                .build();
        reviewRepository.save(review);
        log.info("Created review id={} for filmId={} by userId={}", review.getId(), request.getFilmId(), userId);

        // Create initial upvote by author
        Vote vote = Vote.builder()
                .user(user)
                .review(review)
                .value(1)
                .build();
        voteRepository.save(vote);
        return ReviewsDTO.fromReview(review, true, false);
    }

    @Caching(evict = {
            @CacheEvict(value = "reviewReplies", allEntries = true),
            @CacheEvict(value = "filmReviews", allEntries = true),
            @CacheEvict(value = "userReviews", allEntries = true),
            @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    @Transactional
    public ReviewsDTO createReply(CreateReplyRequest request, User user) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Creating reply to reviewId={} by userId={}", request.getReplyToId(), userId);

        Review parent = reviewRepository.findById(request.getReplyToId()).orElseThrow();
        parent.setReplyCount(parent.getReplyCount() + 1);

        Review reply = Review.builder()
                .user(user)
                .filmId(parent.getFilmId())
                .type(parent.getType())
                .content(request.getContent())
                .answerTo(parent)
                .score(1L)
                .seasonNumber(parent.getSeasonNumber())
                .episodeNumber(parent.getEpisodeNumber())
                .build();
        reviewRepository.save(reply);
        reviewRepository.save(parent);
        log.info("Created reply id={} to parentReviewId={} by userId={}", reply.getId(), parent.getId(), userId);

        // Create vote
        Vote vote = Vote.builder()
                .user(user)
                .review(reply)
                .value(1)
                .build();
        voteRepository.save(vote);
        return ReviewsDTO.fromReview(reply, true, false);
    }

    @Caching(evict = {
            @CacheEvict(value = "reviewReplies", key = "#reviewId"),
            @CacheEvict(value = "filmReviews", allEntries = true),
            @CacheEvict(value = "userReviews", allEntries = true),
            @CacheEvict(value = "userMeDTO", key = "#user.email")
    })
    @Transactional
    public void deleteReview(Long reviewId, User user) {
        Long userId = (user != null) ? user.getId() : null;
        log.info("Deleting reviewId={} by userId={}", reviewId, userId);
        Review review = reviewRepository.findById(reviewId).orElseThrow();
        if (!review.getUser().equals(user)) {
            log.warn("UserId={} attempted to delete reviewId={} which belongs to userId={}", userId, reviewId, review.getUser().getId());
            throw new IllegalArgumentException("Review does not belong to user");
        }
        // delete votes referencing this review to satisfy FK constraints
        voteRepository.deleteByReview_Id(reviewId);

        reviewRepository.delete(review);
        //  Decrease replyCount of parent
        if (review.getAnswerTo() != null) {
            review.getAnswerTo().setReplyCount(review.getAnswerTo().getReplyCount() - 1);
            reviewRepository.save(review.getAnswerTo());
        }
        log.info("Deleted reviewId={} by userId={}", reviewId, userId);
    }


//    ============Helper============

    private List<ReviewsDTO> handleVoteForReviewsDTO(List<Review> reviews, User user) {
        List<Long> reviewIds = reviews.stream().map(Review::getId).toList();

        Map<Integer, List<Long>> reviewIdsByVoteValue = voteService.voteByUserAndReviewIds(user, reviewIds).stream()
                .collect(Collectors.groupingBy(
                        SimpleVoteDTO::getValue,
                        Collectors.mapping(SimpleVoteDTO::getReviewId, Collectors.toList())
                ));
        List<Long> userLikedReviewList = reviewIdsByVoteValue.getOrDefault(1, List.of());
        List<Long> userDislikedReviewList = reviewIdsByVoteValue.getOrDefault(-1, List.of());

        
            return  reviews.stream()
                .map(review -> {
                    boolean userLiked = userLikedReviewList.contains(review.getId());
                    boolean userDisliked = userDislikedReviewList.contains(review.getId());
                    if(!userLiked && !userDisliked) return ReviewsDTO.fromReview(review, false, false);
                    return userLiked
                            ? ReviewsDTO.fromReview(review, true, false)
                            : ReviewsDTO.fromReview(review, false, true);
                }).toList();
    }

    public List<Long> getIdListReviewsByFilmIdNoPage(Long filmId, FilmType filmType, Integer seasonNumber, Integer episodeNumber) {
        if (seasonNumber != null && episodeNumber != null) {
            return reviewRepository.findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumber(filmId, filmType, seasonNumber, episodeNumber).stream()
            .map(Review::getId)
            .toList();
        } else if (seasonNumber != null && episodeNumber == null) {
            return reviewRepository.findByFilmIdAndTypeAndSeasonNumberAndEpisodeNumberIsNull(filmId, filmType, seasonNumber).stream()
            .map(Review::getId)
            .toList();
        } else if (seasonNumber == null && episodeNumber != null) {
            return reviewRepository.findByFilmIdAndTypeAndSeasonNumberIsNullAndEpisodeNumber(filmId, filmType, episodeNumber).stream()
            .map(Review::getId)
            .toList();
        } else {
            return reviewRepository.findByFilmIdAndType(filmId, filmType).stream()
            .map(Review::getId)
            .toList();
        }
    }
}
