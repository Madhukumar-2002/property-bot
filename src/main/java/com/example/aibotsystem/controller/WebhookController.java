package com.example.aibotsystem.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;

@RestController
@RequestMapping("/webhook")
public class WebhookController {

    @Value("${whatsapp.token}")
    private String token;

    @Value("${whatsapp.phoneId}")
    private String phoneId;

    @GetMapping
    public String verifyWebhook(
            @RequestParam("hub.mode") String mode,
            @RequestParam("hub.verify_token") String verifyToken,
            @RequestParam("hub.challenge") String challenge) {

        if ("subscribe".equals(mode) && "my_verify_token".equals(verifyToken)) {
            return challenge;
        }
        return "Verification failed";
    }

    @PostMapping
    public String receiveMessage(@RequestBody String payload) {

        System.out.println("Incoming Webhook: " + payload);

        try {
            JSONObject json = new JSONObject(payload);
            String message = json
                    .getJSONArray("entry")
                    .getJSONObject(0)
                    .getJSONArray("changes")
                    .getJSONObject(0)
                    .getJSONObject("value")
                    .getJSONArray("messages")
                    .getJSONObject(0)
                    .getJSONObject("text")
                    .getString("body");

            String from = json
                    .getJSONArray("entry")
                    .getJSONObject(0)
                    .getJSONArray("changes")
                    .getJSONObject(0)
                    .getJSONObject("value")
                    .getJSONArray("messages")
                    .getJSONObject(0)
                    .getString("from");

            sendReply(from, "AI Reply: " + message);

        } catch (Exception e) {
            e.printStackTrace();
        }

        return "EVENT_RECEIVED";
    }

    private void sendReply(String to, String message) {

        String url = "https://graph.facebook.com/v22.0/" + phoneId + "/messages";

        RestTemplate restTemplate = new RestTemplate();

        JSONObject body = new JSONObject();
        body.put("messaging_product", "whatsapp");
        body.put("to", to);
        body.put("type", "text");

        JSONObject text = new JSONObject();
        text.put("body", message);

        body.put("text", text);

        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set("Authorization", "Bearer " + token);
        headers.set("Content-Type", "application/json");

        org.springframework.http.HttpEntity<String> entity =
                new org.springframework.http.HttpEntity<>(body.toString(), headers);

        restTemplate.postForObject(url, entity, String.class);
    }
}
