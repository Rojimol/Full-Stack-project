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

import com.example.entity.Flight;
import com.example.service.FlightService;

@RestController
@RequestMapping("/api/flights")
@CrossOrigin(origins = "http://localhost:5173")
public class FlightController {
    
    @Autowired
    private FlightService flightService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> bookFlight(@RequestBody Flight flight) {
        Map<String, Object> response = new HashMap<>();
        try {
            Flight booked = flightService.bookFlight(flight);
            response.put("success", true);
            response.put("message", "Flight booked successfully");
            response.put("flight", booked);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Flight>> getUserFlights(@PathVariable Long userId) {
        return ResponseEntity.ok(flightService.getUserFlights(userId));
    }
    
    @GetMapping
    public ResponseEntity<List<Flight>> getAllFlights() {
        return ResponseEntity.ok(flightService.getAllFlights());
    }
    
    @GetMapping("/itinerary/{itineraryId}")
    public ResponseEntity<List<Flight>> getFlightsByItinerary(@PathVariable Long itineraryId) {
        return ResponseEntity.ok(flightService.getFlightsByItinerary(itineraryId));
    }
    
    @PutMapping("/{id}/status")
    public ResponseEntity<Map<String, Object>> updateFlightStatus(@PathVariable Long id, @RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            Flight updated = flightService.updateFlightStatus(id, request.get("status"));
            response.put("success", true);
            response.put("message", "Flight status updated");
            response.put("flight", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFlight(@PathVariable Long id, @RequestBody Flight flight) {
        Map<String, Object> response = new HashMap<>();
        try {
            Flight updated = flightService.updateFlight(id, flight);
            response.put("success", true);
            response.put("message", "Flight updated successfully");
            response.put("flight", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> cancelFlight(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            flightService.cancelFlight(id);
            response.put("success", true);
            response.put("message", "Flight cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Flight>> searchFlights(@RequestParam String query) {
        return ResponseEntity.ok(flightService.searchFlights(query));
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Long>> getFlightCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("totalFlights", flightService.getTotalFlights());
        return ResponseEntity.ok(response);
    }
}