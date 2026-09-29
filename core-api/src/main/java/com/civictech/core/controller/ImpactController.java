package com.civictech.core.controller;

import com.civictech.core.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/v1/projects")
@CrossOrigin(origins = "*")
public class ImpactController {

    @Autowired
    private RecommendedProjectRepository projectRepo;

    @Autowired
    private CitizenFeedbackRepository feedbackRepo;

    @Autowired
    private DemographicDataRepository demographicRepo;

    @Autowired
    private InfrastructureDataRepository infraRepo;

    private RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/{id}/simulate-impact")
    public ResponseEntity<?> simulateImpact(@PathVariable("id") long id) {
        Optional<RecommendedProject> optProject = projectRepo.findById(id);
        if (optProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        RecommendedProject project = optProject.get();
        String hex = project.getH3Index();

        // 1. Gather Baseline Data
        // Infrastructure
        List<InfrastructureData> infraList = infraRepo.findByH3Index(hex);
        double baselineCondition = 0.5;
        if (!infraList.isEmpty()) {
            baselineCondition = infraList.stream().mapToDouble(infra -> infra.getConditionScore()).average().orElse(0.5);
        }
        double baselineDeficit = 1.0 - baselineCondition;

        // Citizen Demand
        List<CitizenFeedback> feedbacks = feedbackRepo.findAll();
        int baselineDemand = 0;
        for (CitizenFeedback fb : feedbacks) {
            if (fb.getLatitude() != null && fb.getLongitude() != null) {
                Map<String, Object> req = new HashMap<>();
                req.put("latitude", fb.getLatitude());
                req.put("longitude", fb.getLongitude());
                req.put("resolution", 9);
                try {
                    Map<?, ?> res = restTemplate.postForObject("http://localhost:8000/api/v1/spatial/h3-index", req, Map.class);
                    if (res != null && res.containsKey("h3_index") && hex.equals(res.get("h3_index"))) {
                        baselineDemand++;
                    }
                } catch (Exception e) {}
            }
        }

        // Demographics
        Optional<DemographicData> optDemo = demographicRepo.findByH3Index(hex);
        int population = optDemo.isPresent() ? optDemo.get().getPopulation() : 0;

        // 2. Apply Deterministic Simulation Logic
        double conditionImprovement = 0.35; // e.g., 35% improvement
        double demandReductionFactor = 0.50; // e.g., 50% reduction in complaints

        double projectedCondition = Math.min(baselineCondition + conditionImprovement, 1.0);
        double projectedDeficit = 1.0 - projectedCondition;
        int projectedDemand = (int) Math.max(baselineDemand * demandReductionFactor, 0);

        // 3. Format Response
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
            "Intervention is assumed to improve relevant infrastructure condition deterministically by +0.35.",
            "Citizen demand is assumed to decrease proportionally (by 50%) after intervention.",
            "This simulation is not a real-world impact forecast."
        );
        response.put("assumptions", assumptions);

        return ResponseEntity.ok(response);
    }
}
