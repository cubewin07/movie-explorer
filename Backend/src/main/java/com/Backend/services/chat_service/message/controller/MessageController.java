package com.Backend.services.chat_service.message.controller;

import com.Backend.exception.ErrorRes;
import com.Backend.services.chat_service.message.dto.MessageDTOPage;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;

import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Backend.services.chat_service.message.dto.MessageDTO;
import com.Backend.services.user_service.model.User;
import com.Backend.services.chat_service.message.service.MessageService;
import com.Backend.services.chat_service.model.ChatLookUpHelper;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;

import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.Set;
import java.nio.file.AccessDeniedException;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
@Tag(name = "Messages", description = "Chat message APIs")
public class MessageController {

    private final MessageService messageService;
    private final ChatLookUpHelper chatLookUpHelper;

    @GetMapping
    @Operation(summary = "Get messages in a chat")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Messages returned successfully"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "User is not a participant of the chat", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Chat not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Page<MessageDTO>> getMessages(
        @AuthenticationPrincipal User user,
        @RequestParam("chatId") Long chatId, 
        @RequestParam("page") int page, 
        @RequestParam(defaultValue = "20", name = "size") int size) throws AccessDeniedException {

        // Enforce membership before returning chat messages
        Set<SimpleUserDTO> participants = chatLookUpHelper.getParticipants(chatId);
        boolean isMember = participants.stream().anyMatch(p -> p.getId().equals(user.getId()));
        if (!isMember) {
            throw new AccessDeniedException("You are not a participant of this chat");
        }

        Pageable pageable = PageRequest.of(page, size);

        MessageDTOPage messageDTOPage = messageService.getMessagesDTO(chatId, page, size);

        Long totalMessages = messageDTOPage.getTotalMessagesAcrossAllPage();
        List<MessageDTO> messageDTOList = messageDTOPage.getMessages();

        Page<MessageDTO> messagePage = new PageImpl<>(messageDTOList, pageable, totalMessages);
        return ResponseEntity.ok(messagePage);
    }

    @PostMapping("/mark-as-read")
    @Operation(summary = "Mark chat messages as read")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Messages marked as read"),
            @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "403", description = "User is not a participant of the chat", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "404", description = "Chat not found", content = @Content(schema = @Schema(implementation = ErrorRes.class))),
            @ApiResponse(responseCode = "500", description = "Internal server error", content = @Content(schema = @Schema(implementation = ErrorRes.class)))
    })
    public ResponseEntity<Void> markMessagesAsRead(@AuthenticationPrincipal User user, @RequestParam("chatId") Long chatId) throws AccessDeniedException {
        // Enforce membership before mutating chat data
        Set<SimpleUserDTO> participants = chatLookUpHelper.getParticipants(chatId);
        boolean isMember = participants.stream().anyMatch(p -> p.getId().equals(user.getId()));
        if (!isMember) {
            throw new AccessDeniedException("You are not a participant of this chat");
        }

        messageService.markMessagesAsRead(chatId, user);
        return ResponseEntity.ok().build();
    }
}
