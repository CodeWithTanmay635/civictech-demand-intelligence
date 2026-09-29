package com.civictech.core.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class RecommendedProject {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String h3Index;

    @Column(nullable = false)
    private String projectType;

    private Double priorityScore;
    
    @Column(columnDefinition="TEXT")
    private String justification;
    
    private String status; // e.g., PROPOSED, FUNDED, COMPLETED
}
