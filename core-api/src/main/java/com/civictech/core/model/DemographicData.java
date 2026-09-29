package com.civictech.core.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class DemographicData {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String h3Index;

    @Column(nullable = false)
    private Integer population;

    @Column(nullable = false)
    private Double vulnerabilityScore; // 0.0 to 1.0
}
