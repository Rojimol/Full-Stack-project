package com.example.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/weather")
@CrossOrigin(origins = "http://localhost:5173")
public class WeatherController {
    
    @GetMapping
    public ResponseEntity<Map<String, Object>> getWeather(@RequestParam(defaultValue = "Goa, India") String location) {
        Map<String, Object> response = new HashMap<>();
        
        Map<String, Object> current = new HashMap<>();
        current.put("location", location);
        current.put("temperature", 32);
        current.put("condition", "Sunny");
        current.put("humidity", 65);
        current.put("windSpeed", 12);
        current.put("feelsLike", 35);
        current.put("icon", "sun");
        
        List<Map<String, Object>> forecast = new ArrayList<>();
        String[] days = {"Today", "Sat", "Sun", "Mon", "Tue"};
        String[] conditions = {"Sunny", "Partly Cloudy", "Rainy", "Thunderstorms", "Cloudy"};
        String[] icons = {"sun", "cloud", "rain", "rain", "cloud"};
        
        for (int i = 0; i < 5; i++) {
            Map<String, Object> day = new HashMap<>();
            day.put("day", days[i]);
            day.put("date", "Jun " + (15 + i));
            day.put("high", 30 + (i % 3));
            day.put("low", 24 + (i % 2));
            day.put("condition", conditions[i]);
            day.put("icon", icons[i]);
            forecast.add(day);
        }
        
        List<Map<String, Object>> alerts = new ArrayList<>();
        if (location.toLowerCase().contains("goa") || location.toLowerCase().contains("mumbai")) {
            Map<String, Object> alert1 = new HashMap<>();
            alert1.put("type", "rain");
            alert1.put("title", "Heavy Rainfall Warning");
            alert1.put("message", "Heavy rainfall expected on Sunday. Potential travel disruptions.");
            alert1.put("severity", "high");
            alerts.add(alert1);
        }
        
        response.put("current", current);
        response.put("forecast", forecast);
        response.put("alerts", alerts);
        
        return ResponseEntity.ok(response);
    }
}
