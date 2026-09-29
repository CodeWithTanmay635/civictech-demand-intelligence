package com.civictech.core.model;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface DemographicDataRepository extends JpaRepository<DemographicData, Long> {
    Optional<DemographicData> findByH3Index(String h3Index);
}
