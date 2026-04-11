package com.Backend.services.credit_service.repository;

import com.Backend.services.credit_service.model.UserCreditWeight;
import com.Backend.services.credit_service.model.UserCreditWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserCreditWeightRepository extends JpaRepository<UserCreditWeight, UserCreditWeightId> {
    List<UserCreditWeight> findAllByUserReference_User_Id(Long userId);
}
