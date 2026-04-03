package com.Backend.services.keyword_service.repository;

import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.model.UserKeywordWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserKeywordWeightRepository extends JpaRepository<UserKeywordWeight, UserKeywordWeightId> {
    List<UserKeywordWeight> findAllByUserReference_User_Id(Long userId);
}
