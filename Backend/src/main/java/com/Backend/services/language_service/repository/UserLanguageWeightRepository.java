package com.Backend.services.language_service.repository;

import com.Backend.services.language_service.model.UserLanguageWeight;
import com.Backend.services.language_service.model.UserLanguageWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserLanguageWeightRepository extends JpaRepository<UserLanguageWeight, UserLanguageWeightId> {
    List<UserLanguageWeight> findAllByUserReference_User_Id(Long userId);

    @Modifying
    @Query(value = """
        update user_language_weight
        set weight = weight + :delta
        where user_id = :userId
          and language_code = :languageCode
        """, nativeQuery = true)
    int incrementWeight(
        @Param("userId") Long userId,
        @Param("languageCode") String languageCode,
        @Param("delta") long delta
    );

    @Modifying
    @Query(value = """
        insert into user_language_weight (user_id, language_code, weight)
        values (:userId, :languageCode, :weight)
        on conflict (user_id, language_code) do nothing
        """, nativeQuery = true)
    int insertIfAbsent(
        @Param("userId") Long userId,
        @Param("languageCode") String languageCode,
        @Param("weight") long weight
    );

    @Modifying
    @Query(value = """
        delete from user_language_weight
        where user_id = :userId
          and language_code = :languageCode
          and weight <= 0
        """, nativeQuery = true)
    int deleteIfNonPositive(
        @Param("userId") Long userId,
        @Param("languageCode") String languageCode
    );
}
