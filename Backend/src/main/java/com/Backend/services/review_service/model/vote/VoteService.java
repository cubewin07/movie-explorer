package com.Backend.services.review_service.model.vote;

import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteRepository voteRepository;
    private final ReviewRepository reviewRepository;

    @Cacheable(value = "userVotes", key = "{ (#user != null ? #user.id : 0), #reviewIds }")
    public List<Vote> voteByUserAndReviewIds(User user, List<Long> reviewIds) {
        return voteRepository.findByUserAndReview_IdIn(user, reviewIds);
    }

    @Transactional
    @CacheEvict(value = {"userVotes", "filmReviews", "reviewReplies", "userReviews"}, allEntries = true)
    public void updateVote(VoteStateRequest request, User user) {
        Vote existingVote = voteRepository.findByUserAndReview_Id(user, request.getReviewId());
        Review review = reviewRepository.findById(request.getReviewId()).orElseThrow();

        int newValue = request.getValue(); // expected -1, 0, or 1

        if (existingVote == null) {
            if (newValue == 0) {
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
            return;
        }

        // existing vote present
        int oldValue = existingVote.getValue();
        if (oldValue == newValue) {
            return; // no changes
        }
        if (newValue == 0) {
            // remove vote and decrease score by old value
            review.setScore((review.getScore() == null ? 0L : review.getScore()) - oldValue);
            reviewRepository.save(review);
            voteRepository.delete(existingVote);
            return;
        }
        // switch vote
        int delta = newValue - oldValue;
        existingVote.setValue(newValue);
        voteRepository.save(existingVote);
        review.setScore((review.getScore() == null ? 0L : review.getScore()) + delta);
        reviewRepository.save(review);
    }

}
