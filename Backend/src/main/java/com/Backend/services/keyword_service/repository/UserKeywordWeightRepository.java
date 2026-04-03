package com.Backend.services.keyword_service.repository;

import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.model.UserKeywordWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserKeywordWeightRepository extends JpaRepository<UserKeywordWeight, UserKeywordWeightId> {
    List<UserKeywordWeight> findAllByUser_Id(Long userId);

    @Modifying
    @Query(value = "insert into user_film_reference (user_id) values (?1) on conflict (user_id) do nothing", nativeQuery = true)
    void ensureUserFilmReference(Long userId);
}
