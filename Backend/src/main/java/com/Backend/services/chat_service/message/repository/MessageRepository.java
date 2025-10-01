package com.Backend.services.chat_service.message.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Backend.services.chat_service.message.model.Message;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageRepository extends JpaRepository<Message, Long>{
    Page<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);
    Message findTopByChatIdOrderByCreatedAtDesc(Long chatId);
}
