package com.Backend.services.chat_service.message.repository;

import java.util.Optional;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Backend.services.chat_service.message.model.Message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageRepository extends JpaRepository<Message, Long>{
    Page<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);

    Set<Message> findByChatIdAndSenderIdAndReadFalse(Long chatId, Long senderId);
    
    /**
     * Find the most recent message in a chat
     * @param chatId The ID of the chat
     * @return Optional containing the latest message if it exists, empty otherwise
     */
    Optional<Message> findTopByChatIdOrderByCreatedAtDesc(Long chatId);
}
