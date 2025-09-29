package com.Backend.websocket.controller;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import org.springframework.messaging.handler.annotation.MessageMapping;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class STOMPController {
    private final SimpMessagingTemplate template;
    
    @MessageMapping("/hello")
    public void hello() {
        template.convertAndSend("/topic/hello", "Hello, World!");
    }
}
