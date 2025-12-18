package com.Backend.services.review_service.model.vote;

import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoteService {
    private final VoteRepository voteRepository;
    private final ReviewRepository reviewRepository;

    @Cacheable(value = "userVotes", key = "{ (#user != null ? #user.id : 0), #reviewIds }")
    public List<Vote> voteByUserAndReviewIds(User user, List<Long> reviewIds) {
        Long userId = (user != null ? user.getId() : null);
        log.info("Fetching votes for userId={}, reviewIds.size={} ", userId, (reviewIds != null ? reviewIds.size() : 0));
        List<Vote> votes = voteRepository.findByUserAndReview_IdIn(user, reviewIds);
        log.debug("Fetched {} votes for userId={}", (votes != null ? votes.size() : 0), userId);
        return votes;
    }

    @Transactional
    @CacheEvict(value = {"userVotes", "filmReviews", "reviewReplies", "userReviews"}, allEntries = true)
    public void updateVote(VoteStateRequest request, User user) {
        Long userId = (user != null ? user.getId() : null);
        Long reviewId = request != null ? request.getReviewId() : null;
        Integer reqValue = request != null ? request.getValue() : null;
        log.info("Updating vote: userId={}, reviewId={}, newValue={}", userId, reviewId, reqValue);

        Vote existingVote = voteRepository.findByUserAndReview_Id(user, request.getReviewId());
        Review review = reviewRepository.findById(request.getReviewId()).orElseThrow();

        int newValue = request.getValue(); // expected -1, 0, or 1

        if (existingVote == null) {
            if (newValue == 0) {
                log.debug("No existing vote and newValue=0 -> no-op (userId={}, reviewId={})", userId, reviewId);
                return; // nothing to do
            }
            // create new vote and update score
            Vote vote = Vote.builder()
                    .user(user)
                    .review(review)
                    .value(newValue)
                    .build();
            voteRepository.save(vote);
            review.setScore((review.getScore() == null ? 0L : review.getScore()) + newValue);
            reviewRepository.save(review);
            log.info("Created new vote (value={}) for userId={} on reviewId={}, newScore={} ", newValue, userId, reviewId, review.getScore());
            return;
        }

        // existing vote present
        int oldValue = existingVote.getValue();
        if (oldValue == newValue) {
            log.debug("Vote unchanged (value={}) for userId={} on reviewId={} -> no-op", newValue, userId, reviewId);
            return; // no changes
        }
        if (newValue == 0) {
            // remove vote and decrease score by old value
            review.setScore((review.getScore() == null ? 0L : review.getScore()) - oldValue);
            reviewRepository.save(review);
            voteRepository.delete(existingVote);
            log.info("Removed vote (oldValue={}) for userId={} on reviewId={}, newScore={}", oldValue, userId, reviewId, review.getScore());
            return;
        }
        // switch vote
        int delta = newValue - oldValue;
        existingVote.setValue(newValue);
        voteRepository.save(existingVote);
        review.setScore((review.getScore() == null ? 0L : review.getScore()) + delta);
        reviewRepository.save(review);
        log.info("Updated vote from {} to {} for userId={} on reviewId={}, delta={}, newScore={}", oldValue, newValue, userId, reviewId, delta, review.getScore());
    }

}
