package com.Backend.services.chat_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.services.chat_service.model.DTO.ChatCreateDTOID;
import com.Backend.services.chat_service.model.DTO.ChatCreateGroupID;
import com.Backend.services.chat_service.model.DTO.ChatResponseDTO;
import com.Backend.services.chat_service.model.DTO.SimpleChatDTO;
import com.Backend.services.chat_service.service.ChatService;
import com.Backend.services.chat_service.model.ChatLookUpHelper;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.services.user_service.model.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Set;
import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final ChatLookUpHelper chatLookUpHelper;

    @PostMapping("/private")
    @Transactional
    public ResponseEntity<SimpleChatDTO> createChat(@RequestBody ChatCreateDTOID chat, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.createChat(chat.userIds(), user));
    }

    @PostMapping("/group")
    public ResponseEntity<Long> createGroupChat(@RequestBody ChatCreateDTOID chat) {
        Long chatId = chatService.createGroupChatByIds(chat.userIds()).getId();
        return ResponseEntity.ok(chatId);
    }

    @GetMapping()
    public ResponseEntity<ChatResponseDTO> getChat(@RequestParam("chatId") Long chatId, @AuthenticationPrincipal User user) throws AccessDeniedException {
        // Enforce membership before returning chat metadata
        Set<SimpleUserDTO> participants = chatLookUpHelper.getParticipants(chatId);
        boolean isMember = participants.stream().anyMatch(p -> p.getId().equals(user.getId()));
        if (!isMember) {
            throw new AccessDeniedException("You are not a participant of this chat");
        }
        return ResponseEntity.ok(chatService.gettingChatDTO(chatId));
    }
}
