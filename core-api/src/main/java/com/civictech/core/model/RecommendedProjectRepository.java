package com.civictech.core.model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecommendedProjectRepository extends JpaRepository<RecommendedProject, Long> {
    List<RecommendedProject> findByH3Index(String h3Index);
}
