package com.example.aibotsystem.service;

import org.springframework.stereotype.Service;

@Service
public class AIService {

    public String getAIReply(String userMessage) {

        userMessage = userMessage.toLowerCase();

        if (userMessage.contains("hi") || userMessage.contains("hello")) {
            return "Hello 👋 Welcome to our Real Estate Service! Are you looking to Buy, Sell, or Rent a property?";
        }
        else if (userMessage.contains("buy")) {
            return "Great 🏠 Could you tell me which location you are interested in buying property?";
        }
        else if (userMessage.contains("rent")) {
            return "Sure 👍 Please share the location and your monthly budget for rent.";
        }
        else if (userMessage.contains("sell")) {
            return "We can help you sell your property! Please share the property location and type (house, flat, land).";
        }
        else if (userMessage.matches(".*\\d+.*")) {
            return "Thanks for the details! Our property expert will contact you shortly 📞";
        }
        else {
            return "Could you please tell me if you want to Buy, Sell, or Rent a property?";
        }
    }
}
