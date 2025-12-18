package com.Backend.services.review_service.model.vote;

import com.Backend.services.review_service.model.Review;
import com.Backend.services.review_service.repository.ReviewRepository;
import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteRepository voteRepository;
    private final ReviewRepository reviewRepository;

    public List<Vote> voteByUserAndReviewIds(User user, List<Long> reviewIds) {
        return voteRepository.findByUserAndReview_IdIn(user, reviewIds);
    }

    public void updateVote(VoteStateRequest request, User user) {
        Vote existingVote = voteRepository.findByUserAndReview_Id(user, request.getReviewId());
        Review review = reviewRepository.findById(request.getReviewId()).orElseThrow();

        //   vote exists
        if(existingVote != null) {
            if(existingVote.getValue() == request.getValue()) return;
            if(existingVote.getValue() == 0) {
                voteRepository.delete(existingVote);
            }
            existingVote.setValue(request.getValue());
            review.setScore(review.getScore() + (request.getValue() - existingVote.getValue()));
            voteRepository.save(existingVote);
            reviewRepository.save(review);
        }

        // create a vote
        Vote vote = Vote.builder()
                .user(user)
                .value(request.getValue())
                .review(review)
                .build();
        voteRepository.save(vote);
    }

}
