package com.Backend.services.chat_service.controller;

import com.Backend.exception.ErrorRes;
import lombok.RequiredArgsConstructor;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.services.chat_service.model.DTO.ChatCreateDTOID;
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
@Tag(name = "Chats", description = "Chat creation and retrieval APIs")
public class ChatController {

    private final ChatService chatService;
    private final ChatLookUpHelper chatLookUpHelper;

    @PostMapping("/private")
    @Transactional
    @Operation(summary = "Create private chat")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Private chat created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid chat request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<SimpleChatDTO> createChat(@RequestBody ChatCreateDTOID chat, @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.createChat(chat.userIds(), user));
    }

    @PostMapping("/group")
    @Operation(summary = "Create group chat")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Group chat created successfully"),
            @ApiResponse(responseCode = "400", description = "Invalid chat request", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "User not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Long> createGroupChat(@RequestBody ChatCreateDTOID chat) {
        Long chatId = chatService.createGroupChatByIds(chat.userIds()).getId();
        return ResponseEntity.ok(chatId);
    }

    @GetMapping()
    @Operation(summary = "Get chat metadata")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Chat metadata returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "User is not a participant of the chat", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Chat not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
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
