package com.civictech.core.controller;

import com.civictech.core.model.CitizenFeedback;
import com.civictech.core.model.CitizenFeedbackRepository;
import com.civictech.core.model.WebhookPayload;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class WebhookController {

    @Autowired
    private CitizenFeedbackRepository repository;

    @org.springframework.beans.factory.annotation.Value("${AI_ENGINE_URL:http://127.0.0.1:8000}")
    private String aiEngineUrl;

    private RestTemplate restTemplate = new RestTemplate();

    @PostMapping("/webhooks/citizen-feedback")
    public ResponseEntity<String> ingestFeedback(@RequestBody WebhookPayload payload) {
        CitizenFeedback feedback = new CitizenFeedback();
        feedback.setMessageId(payload.getMessageId());
        feedback.setSourcePlatform(payload.getSourcePlatform());
        try {
            feedback.setTimestamp(Instant.parse(payload.getTimestamp()));
        } catch (Exception e) {
            feedback.setTimestamp(Instant.now());
        }
        if (payload.getLocation() != null) {
            feedback.setLatitude(payload.getLocation().getLatitude());
            feedback.setLongitude(payload.getLocation().getLongitude());
        }
        feedback.setFeedbackText(payload.getFeedbackText());

        // Perform Semantic Analysis
        try {
            Map<String, String> semReq = new HashMap<>();
            semReq.put("text", payload.getFeedbackText());
            @SuppressWarnings("unchecked")
            Map<String, Object> semRes = (Map<String, Object>) restTemplate.postForObject(aiEngineUrl + "/api/v1/ai/semantic/analyze", semReq, Map.class);
            if (semRes != null) {
                feedback.setLanguage((String) semRes.get("detected_language"));
                feedback.setOriginalText((String) semRes.get("original_text"));
                feedback.setNormalizedText((String) semRes.get("normalized_text"));
                @SuppressWarnings("unchecked")
                List<Double> embList = (List<Double>) semRes.get("embedding");
                if (embList != null) {
                    feedback.setEmbedding(embList.toArray(new Double[0]));
                }
            }
        } catch (Exception e) {
            // Ignore API call errors to FastAPI for demo
            feedback.setOriginalText(payload.getFeedbackText());
        }

        repository.save(feedback);
        return ResponseEntity.accepted().body("Payload accepted for processing");
    }

    private List<Map<String, Object>> cachedHotspots = null;
    private long lastCacheTime = 0;

    @GetMapping("/hotspots")
    public ResponseEntity<List<Map<String, Object>>> getHotspots() {
        if (cachedHotspots != null && System.currentTimeMillis() - lastCacheTime < 300000) {
            return ResponseEntity.ok(cachedHotspots);
        }
        
        List<CitizenFeedback> feedbacks = repository.findAll();
        Map<String, Integer> hexCounts = new HashMap<>();
        
        for (CitizenFeedback fb : feedbacks) {
            if (fb.getLatitude() == null) continue;
            Map<String, Object> req = new HashMap<>();
            req.put("latitude", fb.getLatitude());
            req.put("longitude", fb.getLongitude());
            req.put("resolution", 9);
            try {
                Map<?, ?> res = restTemplate.postForObject(aiEngineUrl + "/api/v1/spatial/h3-index", req, Map.class);
                if (res != null && res.containsKey("h3_index")) {
                    String hex = (String) res.get("h3_index");
                    hexCounts.put(hex, hexCounts.getOrDefault(hex, 0) + 1);
                }
            } catch (Exception e) {
                // Ignore API call errors to FastAPI for demo
            }
        }

        Map<String, Object> matrix = new HashMap<>();
        matrix.put("criteria", Arrays.asList("count"));
        List<Map<String, Object>> alts = new ArrayList<>();
        
        for (Map.Entry<String, Integer> entry : hexCounts.entrySet()) {
            Map<String, Object> alt = new HashMap<>();
            alt.put("id", entry.getKey());
            // FastAPI requires values as a dict {criteriaName: value}, NOT a list
            Map<String, Double> valuesMap = new HashMap<>();
            valuesMap.put("count", (double) entry.getValue());
            alt.put("values", valuesMap);
            alts.add(alt);
        }
        matrix.put("alternatives", alts);
        
        try {
            List<?> response = restTemplate.postForObject(aiEngineUrl + "/api/v1/ai/prioritize", matrix, List.class);
            List<Map<String, Object>> result = new ArrayList<>();
            if (response != null) {
                for (Object itemObj : response) {
                    Map<?, ?> item = (Map<?, ?>) itemObj;
                    Map<String, Object> frontendItem = new HashMap<>();
                    frontendItem.put("hex", item.get("id"));
                    frontendItem.put("count", hexCounts.get(item.get("id")));
                    result.add(frontendItem);
                }
            }
            cachedHotspots = result;
            lastCacheTime = System.currentTimeMillis();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("[HOTSPOTS ERROR] " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Collections.emptyList());
        }
    }
}
