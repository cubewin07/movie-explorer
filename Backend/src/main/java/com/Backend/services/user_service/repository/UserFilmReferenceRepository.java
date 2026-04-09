package com.Backend.services.user_service.repository;

import com.Backend.services.user_service.model.UserFilmReference;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserFilmReferenceRepository extends JpaRepository<UserFilmReference, Long> {

    @Modifying
    @Query(value = "insert into user_film_reference (user_id) values (?1) on conflict (user_id) do nothing", nativeQuery = true)
    void ensureUserFilmReference(Long userId);
}
