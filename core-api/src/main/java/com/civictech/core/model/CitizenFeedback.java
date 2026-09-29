package com.civictech.core.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.Instant;

@Data
@Entity
@Table(name = "citizen_feedback")
public class CitizenFeedback {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String messageId;
    private String sourcePlatform;
    private Instant timestamp;
    
    private Double latitude;
    private Double longitude;
    
    @Column(columnDefinition = "TEXT")
    private String feedbackText;

    private String language;
    
    @Column(columnDefinition = "TEXT")
    private String originalText;
    
    @Column(columnDefinition = "TEXT")
    private String translatedText;
    
    @Column(columnDefinition = "TEXT")
    private String normalizedText;
    
    @Column(columnDefinition = "float8[]")
    private Double[] embedding;
}
