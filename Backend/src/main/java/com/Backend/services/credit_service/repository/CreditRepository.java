package com.Backend.services.credit_service.repository;

import com.Backend.services.credit_service.model.Credit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditRepository extends JpaRepository<Credit, Long> {
}
