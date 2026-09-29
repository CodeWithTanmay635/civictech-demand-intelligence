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
    
    // For pgvector, we would use a native query or a specialized library to handle the vector column type
    // @Column(columnDefinition = "vector(384)")
    // private float[] embedding;
}
