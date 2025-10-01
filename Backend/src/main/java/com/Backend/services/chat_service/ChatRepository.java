package com.Backend.services.chat_service;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.lang.NonNull;

import com.Backend.services.user_service.model.User;

import io.lettuce.core.dynamic.annotation.Param;

import java.util.Set;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    @NonNull
    @EntityGraph(attributePaths = {"participants", "messages"})
    Optional<Chat> findById(@NonNull Long id);

    @Query("""
    select c from Chat c
    where :user1 member of c.participants
    and :user2 member of c.participants
""")
    Set<Chat> findChatByParticipants(@NonNull @Param("user1") User user1, @NonNull @Param("user2") User user2);

    @Query("""
    select c from Chat c
    where :user1 member of c.participants
    and :user2 member of c.participants
    and SIZE(c.participants) = 2
""")
    Optional<Chat> findPrivateChat(@NonNull @Param("user1") User user1, @NonNull @Param("user2") User user2);



    Set<Chat> findByParticipantsContaining(User user);
}
