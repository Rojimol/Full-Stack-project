package com.example.controller;

import com.example.entity.Recommendation;
import com.example.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/recommendations")
@CrossOrigin(origins = "http://localhost:5173")
public class RecommendationController {
    
    @Autowired
    private RecommendationService recommendationService;
    
    @GetMapping
    public ResponseEntity<List<Recommendation>> getRecommendations(
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) String category) {
        return ResponseEntity.ok(recommendationService.getRecommendations(destination, category));
    }
}
