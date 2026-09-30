package com.civictech.core.controller;

import com.civictech.core.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.*;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class ImpactController {

    @Autowired
    private RecommendedProjectRepository projectRepo;

    @Autowired
    private DemographicDataRepository demographicRepo;

    @Autowired
    private InfrastructureDataRepository infraRepo;

    @Autowired
    private WebhookController webhookController;



    @PostMapping("/{id}/simulate-impact")
    public ResponseEntity<?> simulateImpact(@PathVariable("id") long id) {
        Optional<RecommendedProject> optProject = projectRepo.findById(id);
        if (optProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        RecommendedProject project = optProject.get();
        String hex = project.getH3Index();

        // 1. Infrastructure baseline from DB (fast, no FastAPI call)
        List<InfrastructureData> infraList = infraRepo.findByH3Index(hex);
        double baselineCondition = 0.5;
        if (!infraList.isEmpty()) {
            @SuppressWarnings("null")
            double avg = infraList.stream()
                .mapToDouble(InfrastructureData::getConditionScore)
                .average().orElse(0.5);
            baselineCondition = avg;
        }
        double baselineDeficit = 1.0 - baselineCondition;

        // 2. Citizen demand from cached hotspot list (avoids N+1 FastAPI calls)
        int baselineDemand = 0;
        try {
            // Re-use the cached hotspot response from WebhookController
            var hotspotsResp = webhookController.getHotspots();
            List<Map<String, Object>> hotspots = hotspotsResp.getBody();
            if (hotspots != null) {
                for (Map<String, Object> hotspot : hotspots) {
                    if (hex.equals(hotspot.get("hex"))) {
                        Object count = hotspot.get("count");
                        if (count instanceof Number) {
                            baselineDemand = ((Number) count).intValue();
                        }
                        break;
                    }
                }
            }
        } catch (Exception e) {
            // Fallback: use 0 demand if cache not available
            baselineDemand = 0;
        }

        // 3. Demographics
        Optional<DemographicData> optDemo = demographicRepo.findByH3Index(hex);
        int population = optDemo.isPresent() ? optDemo.get().getPopulation() : 0;

        // 4. Deterministic simulation
        double conditionImprovement = 0.35;
        double demandReductionFactor = 0.50;

        double projectedCondition = Math.min(baselineCondition + conditionImprovement, 1.0);
        double projectedDeficit = 1.0 - projectedCondition;
        int projectedDemand = (int) Math.max(baselineDemand * demandReductionFactor, 0);

        // 5. Build response
        Map<String, Object> response = new HashMap<>();
        response.put("project_id", project.getId());
        response.put("project_type", project.getProjectType());
        response.put("h3_index", project.getH3Index());

        Map<String, Object> baseline = new HashMap<>();
        baseline.put("citizen_demand", baselineDemand);
        baseline.put("infrastructure_condition", baselineCondition);
        baseline.put("infrastructure_deficit", baselineDeficit);
        baseline.put("population_affected", population);

        Map<String, Object> projected = new HashMap<>();
        projected.put("citizen_demand", projectedDemand);
        projected.put("infrastructure_condition", projectedCondition);
        projected.put("infrastructure_deficit", projectedDeficit);
        projected.put("population_affected", population);

        Map<String, Object> change = new HashMap<>();
        change.put("citizen_demand", projectedDemand - baselineDemand);
        change.put("infrastructure_condition", projectedCondition - baselineCondition);
        change.put("infrastructure_deficit", projectedDeficit - baselineDeficit);

        Map<String, Object> simulation = new HashMap<>();
        simulation.put("baseline", baseline);
        simulation.put("projected", projected);
        simulation.put("change", change);

        response.put("simulation", simulation);

        List<String> assumptions = Arrays.asList(
            "Simulation uses synthetic demonstration data.",
            "Intervention improves infrastructure condition deterministically by +0.35.",
            "Citizen demand decreases by 50% after intervention.",
            "This simulation is not a real-world impact forecast."
        );
        response.put("assumptions", assumptions);

        return ResponseEntity.ok(response);
    }
}
