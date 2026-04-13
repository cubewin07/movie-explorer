package com.Backend.services.genre_service.repository;

import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.model.UserGenreWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserGenreWeightRepository extends JpaRepository<UserGenreWeight, UserGenreWeightId> {
    List<UserGenreWeight> findAllByUserReference_User_Id(Long userId);

    @Modifying
    @Query(value = """
        update user_genre_weight
        set weight = weight + :delta,
        type = :type
        where user_id = :userId
          and genre_id = :genreId
        """, nativeQuery = true)
    int incrementWeight(
        @Param("userId") Long userId,
        @Param("genreId") Long genreId,
        @Param("delta") long delta,
        @Param("type") String type
    );

    @Modifying
    @Query(value = """
        insert into user_genre_weight (user_id, genre_id, weight, type)
        values (:userId, :genreId, :weight, :type)
        on conflict (user_id, genre_id) do nothing
        """, nativeQuery = true)
    int insertIfAbsent(
        @Param("userId") Long userId,
        @Param("genreId") Long genreId,
        @Param("weight") long weight,
        @Param("type") String type
    );

    @Modifying
    @Query(value = """
        delete from user_genre_weight
        where user_id = :userId
          and genre_id = :genreId
          and weight <= 0
        """, nativeQuery = true)
    int deleteIfNonPositive(
        @Param("userId") Long userId,
        @Param("genreId") Long genreId
    );
}
