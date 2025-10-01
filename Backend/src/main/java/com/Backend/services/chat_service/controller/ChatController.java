package com.Backend.services.chat_service.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.services.chat_service.model.ChatCreateDTOID;
import com.Backend.services.chat_service.model.ChatCreateGroupID;
import com.Backend.services.chat_service.model.ChatResponseDTO;
import com.Backend.services.chat_service.service.ChatService;
import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.model.Chat;
import com.Backend.services.chat_service.message.model.Message;

@RestController
@RequestMapping("/chats")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    private final MessageService messageService;

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

    @GetMapping()
    public ResponseEntity<ChatResponseDTO> getChat(@RequestParam("chatId") Long chatId) {
        Chat chat = chatService.getChatById(chatId);
        Message latestMessage = messageService.getLatestMessage(chatId);
        ChatResponseDTO chatResponseDTO = new ChatResponseDTO(chatId, chat.getParticipants(), latestMessage.getContent(), latestMessage.getSender().getUsername(), latestMessage.getCreatedAt());
        return ResponseEntity.ok(chatResponseDTO);
    
    }
}
