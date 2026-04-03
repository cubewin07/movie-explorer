package com.Backend.services.genre_service.repository;

import com.Backend.services.genre_service.model.UserGenreWeight;
import com.Backend.services.genre_service.model.UserGenreWeightId;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

public interface UserGenreWeightRepository extends JpaRepository<UserGenreWeight, UserGenreWeightId> {
    List<UserGenreWeight> findAllByUser_Id(Long userId);

    @Modifying
    @Query(value = "insert into user_film_reference (user_id) values (?1) on conflict (user_id) do nothing", nativeQuery = true)
    void ensureUserFilmReference(Long userId);
}
