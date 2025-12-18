package com.Backend.services.review_service.model.vote;


import com.Backend.services.user_service.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface VoteRepository extends JpaRepository<Vote, Long> {
    List<Vote> findByUserAndReview_IdIn(User user, List<Long> reviewIds );
    Vote findByUserAndReview_Id(User user, Long reviewId);
}
