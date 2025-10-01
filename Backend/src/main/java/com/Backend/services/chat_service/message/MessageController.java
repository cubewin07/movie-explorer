package com.Backend.services.chat_service.message;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<Message> getMessages(@RequestParam Long chatId, @RequestParam int page, @RequestParam int size) {
        return messageService.getMessages(chatId, page, size);
    }
}
