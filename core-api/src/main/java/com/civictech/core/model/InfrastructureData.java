package com.civictech.core.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class InfrastructureData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String h3Index;

    @Column(nullable = false)
    private String category; // e.g., TRANSPORT, WATER, HEALTH

    private Double capacity; // metric relevant to category
    private Double conditionScore; // 0.0 to 1.0 (1 = excellent condition)
}
