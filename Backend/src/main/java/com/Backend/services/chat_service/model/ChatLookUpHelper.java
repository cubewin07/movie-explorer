package com.Backend.services.chat_service.model;

import com.Backend.exception.ChatNotFoundException;
import com.Backend.exception.ChatValidationException;
import com.Backend.services.chat_service.model.DTO.ChatDTO;
import com.Backend.services.chat_service.model.DTO.SimpleChatDTO;
import com.Backend.services.chat_service.repository.ChatRepository;
import com.Backend.services.user_service.model.DTO.SimpleUserDTO;
import com.Backend.services.user_service.model.User;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;
import java.util.stream.Collectors;

@Component
@Slf4j
@RequiredArgsConstructor
public class ChatLookUpHelper {
    private final ChatRepository chatRepository;

    // ==================== Retrieve Chat Methods ====================

    @Transactional(readOnly = true)
    @Cacheable(value = "chatByIdDTO", key = "#id")
    public ChatDTO getChatByIdDTO(Long id) {
        validateNotNull(id, "Chat ID");

        log.debug("Fetching chat DTO with id: {} from database", id);

        Chat chat = chatRepository.findById(id)
                .orElseThrow(() -> new ChatNotFoundException("Chat not found with id: " + id));

        return new ChatDTO(
                chat.getId(),
                convertToSimpleUserDTOs(chat.getParticipants())
        );
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "chats", key = "#user.id")
    public Set<SimpleChatDTO> getChats(User user) {
        validateNotNull(user, "User");

        log.debug("Fetching chats for user: {} from database", user.getId());

        Set<Chat> chats = chatRepository.findByParticipantsContaining(user);
        log.info("Found {} chats for user: {}", chats.size(), user.getId());


        return chats.stream()
                .map(chat -> new SimpleChatDTO(
                        chat.getId(),
                        convertToSimpleUserDTOs(chat.getParticipants())
                ))
                .collect(Collectors.toSet());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "chatParticipants", key = "#chatId")
    public Set<SimpleUserDTO> getParticipants(Long chatId) {
        log.debug("Fetching participants for chat: {} from database", chatId);

        ChatDTO chatResponseDTO = getChatByIdDTO(chatId);
        return chatResponseDTO.participants();

    }

    // Removed @Cacheable - was caching JPA entities which causes Kryo serialization issues
    // This method is provided for other services (like MessageService) to use instead of direct repository access
    @Transactional(readOnly = true)
    public Chat getChatById(Long id) {
        validateNotNull(id, "Chat ID");
        log.debug("Fetching chat entity with id: {} from database", id);
        return chatRepository.findById(id)
                .orElseThrow(() -> new ChatNotFoundException("Chat not found with id: " + id));
    }

    // Helper method to check chat existence
    // Note: Using repository directly here is acceptable as it's a simple existence check
    // and avoids unnecessary DTO conversion for existence validation
    @Transactional(readOnly = true)
    public boolean chatExists(Long chatId) {
        validateNotNull(chatId, "Chat ID");
        return chatRepository.existsById(chatId);
    }


    //  Private helper

    private void validateNotNull(Object obj, String fieldName) {
        if (obj == null) {
            throw new ChatValidationException(fieldName + " cannot be null");
        }
    }

    private Set<SimpleUserDTO> convertToSimpleUserDTOs(Set<User> users) {
        return users.stream()
                .map(user -> {
                    SimpleUserDTO dto = new SimpleUserDTO();
                    dto.setId(user.getId());
                    dto.setEmail(user.getEmail());
                    dto.setUsername(user.getUsername());
                    return dto;
                })
                .collect(Collectors.toSet());
    }

}
