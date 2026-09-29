package com.civictech.core.model;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CitizenFeedbackRepository extends JpaRepository<CitizenFeedback, Long> {
}
