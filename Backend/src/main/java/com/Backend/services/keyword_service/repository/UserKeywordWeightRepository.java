package com.Backend.services.keyword_service.repository;

import com.Backend.services.keyword_service.model.UserKeywordWeight;
import com.Backend.services.keyword_service.model.UserKeywordWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserKeywordWeightRepository extends JpaRepository<UserKeywordWeight, UserKeywordWeightId> {
    List<UserKeywordWeight> findAllByUserReference_User_Id(Long userId);

    @Modifying
    @Query(value = """
        update user_keyword_weight
        set weight = weight + :delta,
        type = :type
        where user_id = :userId
          and keyword_id = :keywordId
        """, nativeQuery = true)
    int incrementWeight(
        @Param("userId") Long userId,
        @Param("keywordId") Long keywordId,
        @Param("delta") long delta,
        @Param("type") String type
    );

    @Modifying
    @Query(value = """
        insert into user_keyword_weight (user_id, keyword_id, weight, type)
        values (:userId, :keywordId, :weight, :type)
        on conflict (user_id, keyword_id) do nothing
        """, nativeQuery = true)
    int insertIfAbsent(
        @Param("userId") Long userId,
        @Param("keywordId") Long keywordId,
        @Param("weight") long weight,
        @Param("type") String type
    );

    @Modifying
    @Query(value = """
        delete from user_keyword_weight
        where user_id = :userId
          and keyword_id = :keywordId
          and weight <= 0
        """, nativeQuery = true)
    int deleteIfNonPositive(
        @Param("userId") Long userId,
        @Param("keywordId") Long keywordId
    );
}
