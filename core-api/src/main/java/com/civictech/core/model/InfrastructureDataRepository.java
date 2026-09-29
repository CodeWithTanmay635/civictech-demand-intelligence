package com.civictech.core.model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InfrastructureDataRepository extends JpaRepository<InfrastructureData, Long> {
    List<InfrastructureData> findByH3Index(String h3Index);
}
