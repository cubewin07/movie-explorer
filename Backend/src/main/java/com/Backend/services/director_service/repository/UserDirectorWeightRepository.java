package com.Backend.services.director_service.repository;

import com.Backend.services.director_service.model.UserDirectorWeight;
import com.Backend.services.director_service.model.UserDirectorWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserDirectorWeightRepository extends JpaRepository<UserDirectorWeight, UserDirectorWeightId> {
    List<UserDirectorWeight> findAllByUser_Id(Long userId);
}
