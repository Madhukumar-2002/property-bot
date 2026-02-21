package com.example.aibotsystem.model;

import jakarta.persistence.*;

@Entity
public class UserMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String userPhone;
    private String message;
    private String aiReply;

    public UserMessage() {}

    public UserMessage(String userPhone, String message) {
        this.userPhone = userPhone;
        this.message = message;
    }

    public Long getId() { return id; }
    public String getUserPhone() { return userPhone; }
    public String getMessage() { return message; }
    public String getAiReply() { return aiReply; }

    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }
    public void setMessage(String message) { this.message = message; }
    public void setAiReply(String aiReply) { this.aiReply = aiReply; }
}
