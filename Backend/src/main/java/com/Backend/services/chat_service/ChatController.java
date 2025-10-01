package com.Backend.services.chat_service;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;

    @PostMapping("/private")
    public ResponseEntity<Long> createChat(@RequestBody ChatCreateDTOID chat) {
        Long chatId = chatService.createChat(chat.user1Id(), chat.user2Id()).getId();
        return ResponseEntity.ok(chatId);
    }

    @PostMapping("/group")
    public ResponseEntity<Long> createGroupChat(@RequestBody ChatCreateGroupID chat) {
        Long chatId = chatService.createGroupChatByIds(chat.userIds()).getId();
        return ResponseEntity.ok(chatId);
    }
}
