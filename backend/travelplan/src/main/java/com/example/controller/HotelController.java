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

import com.example.entity.Hotel;
import com.example.service.HotelService;

@RestController
@RequestMapping("/api/hotels")
@CrossOrigin(origins = "http://localhost:5173")
public class HotelController {
    
    @Autowired
    private HotelService hotelService;
    
    @PostMapping
    public ResponseEntity<Map<String, Object>> bookHotel(@RequestBody Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        try {
            Hotel booked = hotelService.bookHotel(hotel);
            response.put("success", true);
            response.put("message", "Hotel booked successfully");
            response.put("hotel", booked);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Hotel>> getUserHotels(@PathVariable Long userId) {
        return ResponseEntity.ok(hotelService.getUserHotels(userId));
    }
    
    @GetMapping
    public ResponseEntity<List<Hotel>> getAllHotels() {
        return ResponseEntity.ok(hotelService.getAllHotels());
    }
    
    @GetMapping("/itinerary/{itineraryId}")
    public ResponseEntity<List<Hotel>> getHotelsByItinerary(@PathVariable Long itineraryId) {
        return ResponseEntity.ok(hotelService.getHotelsByItinerary(itineraryId));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateHotel(@PathVariable Long id, @RequestBody Hotel hotel) {
        Map<String, Object> response = new HashMap<>();
        try {
            Hotel updated = hotelService.updateHotel(id, hotel);
            response.put("success", true);
            response.put("message", "Hotel updated successfully");
            response.put("hotel", updated);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> cancelHotel(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            hotelService.cancelHotel(id);
            response.put("success", true);
            response.put("message", "Hotel booking cancelled successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/search")
    public ResponseEntity<List<Hotel>> searchHotels(@RequestParam String location) {
        return ResponseEntity.ok(hotelService.searchHotels(location));
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Long>> getHotelCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("totalHotels", hotelService.getTotalHotels());
        return ResponseEntity.ok(response);
    }
}