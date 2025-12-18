package com.Backend.services.review_service.model.vote;

import com.Backend.services.user_service.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VoteService {
    private final VoteRepository voteRepository;

    public List<Vote> voteByUserIdAndReviewIds(User user, List<Long> reviewIds) {
        return voteRepository.findByUserAndReview_IdIn(user, reviewIds);
    }

}
