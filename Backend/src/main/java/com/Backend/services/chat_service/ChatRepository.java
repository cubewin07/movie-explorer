package com.Backend.services.chat_service;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;

import com.Backend.services.user_service.model.User;

import java.util.Set;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    @NonNull
    @EntityGraph(attributePaths = {"participants", "messages"})
    Optional<Chat> findById(@NonNull Long id);


    Set<Chat> findByParticipantsContaining(User user);
}
