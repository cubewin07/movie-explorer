package com.Backend.services.review_service.repository;

import com.Backend.services.review_service.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
}
