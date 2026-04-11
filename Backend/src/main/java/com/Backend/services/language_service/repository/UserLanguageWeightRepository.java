package com.Backend.services.language_service.repository;

import com.Backend.services.language_service.model.UserLanguageWeight;
import com.Backend.services.language_service.model.UserLanguageWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLanguageWeightRepository extends JpaRepository<UserLanguageWeight, UserLanguageWeightId> {
    List<UserLanguageWeight> findAllByUserReference_User_Id(Long userId);
}
