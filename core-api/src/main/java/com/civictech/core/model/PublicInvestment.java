package com.civictech.core.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PublicInvestment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String h3Index;

    @Column(nullable = false)
    private String category;

    private Double plannedBudget;
    private Double spentBudget;
}
