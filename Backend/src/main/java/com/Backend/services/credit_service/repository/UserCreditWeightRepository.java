package com.Backend.services.credit_service.repository;

import com.Backend.services.credit_service.model.UserCreditWeight;
import com.Backend.services.credit_service.model.UserCreditWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserCreditWeightRepository extends JpaRepository<UserCreditWeight, UserCreditWeightId> {
    @EntityGraph(attributePaths = {"role"})
    List<UserCreditWeight> findAllByUserReference_User_Id(Long userId);

    @Modifying
    @Query(value = """
        update user_credit_weight
        set weight = weight + :delta
        where user_id = :userId
          and credit_id = :creditId
          and role_id = :roleId
        """, nativeQuery = true)
    int incrementWeight(
        @Param("userId") Long userId,
        @Param("creditId") Long creditId,
        @Param("roleId") Long roleId,
        @Param("delta") long delta
    );

    @Modifying
    @Query(value = """
        insert into user_credit_weight (user_id, credit_id, role_id, weight)
        values (:userId, :creditId, :roleId, :weight)
        on conflict (user_id, credit_id, role_id) do nothing
        """, nativeQuery = true)
    int insertIfAbsent(
        @Param("userId") Long userId,
        @Param("creditId") Long creditId,
        @Param("roleId") Long roleId,
        @Param("weight") long weight
    );

    @Modifying
    @Query(value = """
        delete from user_credit_weight
        where user_id = :userId
          and credit_id = :creditId
          and role_id = :roleId
          and weight <= 0
        """, nativeQuery = true)
    int deleteIfNonPositive(
        @Param("userId") Long userId,
        @Param("creditId") Long creditId,
        @Param("roleId") Long roleId
    );
}
