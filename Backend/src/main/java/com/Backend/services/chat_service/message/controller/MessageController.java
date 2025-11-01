package com.Backend.services.chat_service.message.controller;

import org.springframework.data.domain.Page;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.chat_service.message.service.MessageService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public ResponseEntity<Page<MessageDTO>> getMessages(
        @RequestParam("chatId") Long chatId, 
        @RequestParam("page") int page, 
        @RequestParam(defaultValue = "20", name = "size") int size) {
        // Note: This endpoint returns entities. For cached performance, consider using getMessagesDTO endpoint
        return ResponseEntity.ok(messageService.getMessagesDTO(chatId, page, size));
    }
}
