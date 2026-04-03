package com.Backend.services.genre_service.repository;

import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.model.UserGenreWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserGenreWeightRepository extends JpaRepository<UserGenreWeight, UserGenreWeightId> {
    List<UserGenreWeight> findAllByUserReference_User_Id(Long userId);
}
