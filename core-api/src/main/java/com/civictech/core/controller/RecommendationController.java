package com.civictech.core.controller;

import com.civictech.core.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class RecommendationController {

    @Autowired
    private CitizenFeedbackRepository feedbackRepo;
    
    @Autowired
    private DemographicDataRepository demographicRepo;
    
    @Autowired
    private InfrastructureDataRepository infraRepo;
    
    @Autowired
    private PublicInvestmentRepository investRepo;

    @Autowired
    private RecommendedProjectRepository projectRepo;

    private RestTemplate restTemplate = new RestTemplate();

    @GetMapping("/projects/recommendations")
    public ResponseEntity<?> getRecommendations(@RequestParam(defaultValue = "10") int limit) {
        // 1. Gather all unique H3 indices and calculate criteria
        List<DemographicData> allDemographics = demographicRepo.findAll();
        Map<String, Map<String, Double>> h3CriteriaMap = new HashMap<>();
        
        // Calculate Demand from Feedback
        List<CitizenFeedback> feedbacks = feedbackRepo.findAll();
        Map<String, Integer> demandCounts = new HashMap<>();
        for (CitizenFeedback fb : feedbacks) {
            if (fb.getLatitude() != null && fb.getLongitude() != null) {
                Map<String, Object> req = new HashMap<>();
                req.put("latitude", fb.getLatitude());
                req.put("longitude", fb.getLongitude());
                req.put("resolution", 9);
                try {
                    Map<?, ?> res = restTemplate.postForObject("http://localhost:8000/api/v1/spatial/h3-index", req, Map.class);
                    if (res != null && res.containsKey("h3_index")) {
                        String hex = (String) res.get("h3_index");
                        demandCounts.put(hex, demandCounts.getOrDefault(hex, 0) + 1);
                    }
                } catch (Exception e) {}
            }
        }
        
        // Normalize demand (max count to 1.0)
        double maxDemand = demandCounts.values().stream().mapToDouble(v -> v).max().orElse(1.0);
        if (maxDemand == 0) maxDemand = 1.0;

        // Build data per H3
        for (DemographicData demo : allDemographics) {
            String hex = demo.getH3Index();
            Map<String, Double> criteria = new HashMap<>();
            
            // C1: Citizen Demand
            criteria.put("citizen_demand", demandCounts.getOrDefault(hex, 0) / maxDemand);
            
            // C2: Vulnerability
            criteria.put("vulnerability", demo.getVulnerabilityScore());
            
            // C3: Infrastructure Deficit
            List<InfrastructureData> infraList = infraRepo.findByH3Index(hex);
            double avgCondition = 0.5;
            if (!infraList.isEmpty()) {
                avgCondition = infraList.stream().mapToDouble(infra -> infra.getConditionScore()).average().orElse(0.5);
            }
            criteria.put("infrastructure_deficit", 1.0 - avgCondition);
            
            // C4: Investment Gap
            List<PublicInvestment> investList = investRepo.findByH3Index(hex);
            double gap = 0.0;
            for (PublicInvestment inv : investList) {
                gap += Math.max(inv.getPlannedBudget() - inv.getSpentBudget(), 0);
            }
            // Simple normalization for gap (assuming max gap ~1M for prototype scale, or self normalize)
            criteria.put("investment_gap", gap); // TOPSIS will normalize it
            
            h3CriteriaMap.put(hex, criteria);
        }
        
        // Normalize investment_gap across all to 0-1 for consistency before TOPSIS (though TOPSIS does vector norm)
        double maxGap = h3CriteriaMap.values().stream().mapToDouble(c -> c.get("investment_gap")).max().orElse(1.0);
        if (maxGap == 0) maxGap = 1.0;
        for (Map<String, Double> criteria : h3CriteriaMap.values()) {
            criteria.put("investment_gap", criteria.get("investment_gap") / maxGap);
        }

        // 2. Prepare DecisionMatrix for FastAPI
        Map<String, Object> matrix = new HashMap<>();
        matrix.put("criteria", Arrays.asList("citizen_demand", "vulnerability", "infrastructure_deficit", "investment_gap"));
        
        List<Map<String, Object>> alts = new ArrayList<>();
        for (Map.Entry<String, Map<String, Double>> entry : h3CriteriaMap.entrySet()) {
            Map<String, Object> alt = new HashMap<>();
            alt.put("id", entry.getKey());
            alt.put("values", entry.getValue());
            alts.add(alt);
        }
        matrix.put("alternatives", alts);
        
        // 3. Call TOPSIS Endpoint
        try {
            List<?> responseList = restTemplate.postForObject("http://localhost:8000/api/v1/ai/prioritize", matrix, List.class);
            
            List<Map<String, Object>> enrichedResults = new ArrayList<>();
            if (responseList != null) {
                // Clear old recommendations for demo reproducibility
                projectRepo.deleteAll();
                
                int count = 0;
                for (Object itemObj : responseList) {
                    if (count >= limit) break;
                    
                    Map<?, ?> item = (Map<?, ?>) itemObj;
                    String hex = (String) item.get("id");
                    
                    // Determine primary deficit category
                    List<InfrastructureData> infraList = infraRepo.findByH3Index(hex);
                    String worstCategory = "general";
                    double lowestCondition = 1.0;
                    for (InfrastructureData infra : infraList) {
                        if (infra.getConditionScore() < lowestCondition) {
                            lowestCondition = infra.getConditionScore();
                            worstCategory = infra.getCategory();
                        }
                    }
                    
                    String projectType = mapCategoryToProjectType(worstCategory);
                    
                    RecommendedProject proj = new RecommendedProject();
                    proj.setH3Index(hex);
                    proj.setProjectType(projectType);
                    proj.setPriorityScore(((Number) item.get("priority_score")).doubleValue());
                    proj.setStatus("PROPOSED");
                    
                    String justification = String.format("Rank %s candidate. High citizen demand (%.2f) combined with vulnerability (%.2f) and significant infrastructure deficit (%.2f) in %s makes this H3 zone a high-priority.",
                        item.get("rank"),
                        ((Map<?, ?>)item.get("criteria")).get("citizen_demand"),
                        ((Map<?, ?>)item.get("criteria")).get("vulnerability"),
                        ((Map<?, ?>)item.get("criteria")).get("infrastructure_deficit"),
                        worstCategory
                    );
                    proj.setJustification(justification);
                    projectRepo.save(proj);
                    
                    Map<String, Object> resultNode = new HashMap<>();
                    resultNode.put("id", proj.getId());
                    resultNode.put("h3_index", hex);
                    resultNode.put("rank", item.get("rank"));
                    resultNode.put("priority_score", item.get("priority_score"));
                    resultNode.put("project_type", projectType);
                    resultNode.put("justification", justification);
                    resultNode.put("criteria", item.get("criteria"));
                    resultNode.put("ahp_weights", item.get("ahp_weights"));
                    resultNode.put("topsis", item.get("topsis"));
                    
                    enrichedResults.add(resultNode);
                    count++;
                }
            }
            
            return ResponseEntity.ok(enrichedResults);
            
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error running decision engine: " + e.getMessage());
        }
    }
    
    private String mapCategoryToProjectType(String category) {
        if (category == null) return "General Improvement";
        switch (category.toLowerCase()) {
            case "water": return "Water Supply Improvement";
            case "road": return "Road Rehabilitation";
            case "healthcare": return "Healthcare Facility Improvement";
            case "school": return "School Infrastructure Improvement";
            case "transport": return "Public Transport Improvement";
            case "sanitation": return "Sanitation Improvement";
            default: return category + " Improvement";
        }
    }
}
