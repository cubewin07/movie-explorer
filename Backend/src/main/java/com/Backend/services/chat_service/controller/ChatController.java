package com.Backend.services.chat_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.services.chat_service.model.DTO.ChatCreateDTOID;
import com.Backend.services.chat_service.model.DTO.ChatCreateGroupID;
import com.Backend.services.chat_service.model.DTO.ChatResponseDTO;
import com.Backend.services.chat_service.model.DTO.ChatDTO;
import com.Backend.services.chat_service.model.DTO.SimpleChatDTO;
import com.Backend.services.chat_service.service.ChatService;
import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.message.dto.MessageDTO;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageService messageService;

    @PostMapping("/private")
    public ResponseEntity<SimpleChatDTO> createChat(@RequestBody ChatCreateDTOID chat) {
        SimpleChatDTO chatDTO = chatService.createChat(chat.user1Id(), chat.user2Id());
        return ResponseEntity.ok(chatDTO);
    }

    @PostMapping("/group")
    public ResponseEntity<Long> createGroupChat(@RequestBody ChatCreateGroupID chat) {
        Long chatId = chatService.createGroupChatByIds(chat.userIds()).getId();
        return ResponseEntity.ok(chatId);
    }

    @GetMapping()
    public ResponseEntity<ChatResponseDTO> getChat(@RequestParam("chatId") Long chatId) {
        return ResponseEntity.ok(chatService.gettingChatDTO(chatId));
    }
}
