package com.example.aibotsystem.controller;

import com.example.aibotsystem.model.UserMessage;
import com.example.aibotsystem.repository.UserMessageRepository;
import com.example.aibotsystem.service.AIService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final UserMessageRepository repository;
    private final AIService aiService;

    public MessageController(UserMessageRepository repository, AIService aiService) {
        this.repository = repository;
        this.aiService = aiService;
    }

    @PostMapping
    public UserMessage saveMessage(@RequestBody UserMessage message) {
        String aiReply = aiService.getAIReply(message.getMessage());
        message.setAiReply(aiReply);
        return repository.save(message);
    }

    @GetMapping
    public List<UserMessage> getAllMessages() {
        return repository.findAll();
    }
}
