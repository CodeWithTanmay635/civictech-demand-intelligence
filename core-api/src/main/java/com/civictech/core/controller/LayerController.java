package com.civictech.core.controller;

import com.civictech.core.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/layers")
@CrossOrigin(origins = "*")
public class LayerController {

    @Autowired
    private DemographicDataRepository demographicRepo;
    
    @Autowired
    private InfrastructureDataRepository infraRepo;
    
    @Autowired
    private PublicInvestmentRepository investRepo;

    @GetMapping("/demographics")
    public ResponseEntity<List<DemographicData>> getDemographics() {
        return ResponseEntity.ok(demographicRepo.findAll());
    }

    @GetMapping("/infrastructure")
    public ResponseEntity<List<InfrastructureData>> getInfrastructure() {
        return ResponseEntity.ok(infraRepo.findAll());
    }

    @GetMapping("/investments")
    public ResponseEntity<List<PublicInvestment>> getInvestments() {
        return ResponseEntity.ok(investRepo.findAll());
    }
}
