package com.example.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.Itinerary;
import com.example.service.ItineraryService;

@RestController
@RequestMapping("/api/itineraries")
@CrossOrigin(origins = "http://localhost:5173")
public class ItineraryController {
    
    @Autowired
    private ItineraryService itineraryService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> createItinerary(@RequestBody Itinerary itinerary) {
        Map<String, Object> response = new HashMap<>();
        try {
            Itinerary created = itineraryService.createItinerary(itinerary);
            response.put("success", true);
            response.put("message", "Itinerary created successfully");
            response.put("itinerary", created);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Itinerary>> getUserItineraries(@PathVariable Long userId) {
        return ResponseEntity.ok(itineraryService.getUserItineraries(userId));
    }
    
    @GetMapping
    public ResponseEntity<List<Itinerary>> getAllItineraries() {
        return ResponseEntity.ok(itineraryService.getAllItineraries());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateItinerary(@PathVariable Long id, @RequestBody Itinerary itinerary) {
        Map<String, Object> response = new HashMap<>();
        try {
            Itinerary updated = itineraryService.updateItinerary(id, itinerary);
            response.put("success", true);
            response.put("message", "Itinerary updated successfully");
            response.put("itinerary", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteItinerary(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            itineraryService.deleteItinerary(id);
            response.put("success", true);
            response.put("message", "Itinerary deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/{id}/duplicate")
    public ResponseEntity<Map<String, Object>> duplicateItinerary(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Itinerary duplicated = itineraryService.duplicateItinerary(id);
            response.put("success", true);
            response.put("message", "Itinerary duplicated successfully");
            response.put("itinerary", duplicated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Itinerary>> searchItineraries(@RequestParam String destination) {
        return ResponseEntity.ok(itineraryService.searchItineraries(destination));
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Long>> getItineraryCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("totalItineraries", itineraryService.getTotalItineraries());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/collaborators")
    public ResponseEntity<Map<String, Object>> addCollaborator(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = payload.get("email");
            Itinerary updated = itineraryService.addCollaborator(id, email);
            response.put("success", true);
            response.put("message", "Collaborator added successfully");
            response.put("itinerary", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @DeleteMapping("/{id}/collaborators/{userId}")
    public ResponseEntity<Map<String, Object>> removeCollaborator(@PathVariable Long id, @PathVariable Long userId) {
        Map<String, Object> response = new HashMap<>();
        try {
            Itinerary updated = itineraryService.removeCollaborator(id, userId);
            response.put("success", true);
            response.put("message", "Collaborator removed successfully");
            response.put("itinerary", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
}
