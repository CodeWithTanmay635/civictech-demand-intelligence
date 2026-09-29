package com.civictech.core.model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PublicInvestmentRepository extends JpaRepository<PublicInvestment, Long> {
    List<PublicInvestment> findByH3Index(String h3Index);
}
