package com.Backend.services.director_service.repository;

import com.Backend.services.director_service.model.Director;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DirectorRepository extends JpaRepository<Director, Long> {}
