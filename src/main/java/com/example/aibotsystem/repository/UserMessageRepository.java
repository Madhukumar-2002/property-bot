package com.example.aibotsystem.repository;

import com.example.aibotsystem.model.UserMessage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserMessageRepository extends JpaRepository<UserMessage, Long> {
}
