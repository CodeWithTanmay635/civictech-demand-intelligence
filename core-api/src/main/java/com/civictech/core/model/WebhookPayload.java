package com.civictech.core.model;

import lombok.Data;
import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class WebhookPayload {
    @JsonProperty("message_id")
    private String messageId;
    @JsonProperty("source_platform")
    private String sourcePlatform;
    private String timestamp;
    private Location location;
    @JsonProperty("feedback_text")
    private String feedbackText;
    private Map<String, String> metadata;
    
    @Data
    public static class Location {
        private Double latitude;
        private Double longitude;
    }
}
