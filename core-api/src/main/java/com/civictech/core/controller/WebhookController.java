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
        repository.save(feedback);
        return ResponseEntity.accepted().body("Payload accepted for processing");
    }

    @GetMapping("/hotspots")
    public ResponseEntity<List<Map<String, Object>>> getHotspots() {
        List<CitizenFeedback> feedbacks = repository.findAll();
        Map<String, Integer> hexCounts = new HashMap<>();
        
        for (CitizenFeedback fb : feedbacks) {
            if (fb.getLatitude() == null) continue;
            Map<String, Object> req = new HashMap<>();
            req.put("latitude", fb.getLatitude());
            req.put("longitude", fb.getLongitude());
            req.put("resolution", 9);
            try {
                Map<?, ?> res = restTemplate.postForObject("http://localhost:8000/api/v1/spatial/h3-index", req, Map.class);
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
            alt.put("values", Arrays.asList((double) entry.getValue()));
            alts.add(alt);
        }
        matrix.put("alternatives", alts);
        
        try {
            List<?> response = restTemplate.postForObject("http://localhost:8000/api/v1/ai/prioritize", matrix, List.class);
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
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
