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
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {
    
    @GetMapping("/flights")
    public ResponseEntity<List<Map<String, Object>>> getFlights(@RequestParam(required = false) String origin, @RequestParam(required = false) String destination) {
        System.out.println("Searching flights: origin=" + origin + ", destination=" + destination);
        List<Map<String, Object>> flights = new ArrayList<>();
        
        // Ensure we handle empty strings from frontend as nulls for default values
        String from = (origin != null && !origin.trim().isEmpty()) ? origin : "DEL";
        String to = (destination != null && !destination.trim().isEmpty()) ? destination : "BOM";
        
        System.out.println("Normalized params: from=" + from + ", to=" + to);
        
        String[] airlines = {"Air India", "IndiGo", "SpiceJet", "Vistara", "Akasa Air"};
        String[] times = {"06:00 AM", "09:30 AM", "01:15 PM", "04:45 PM", "08:00 PM", "11:30 PM"};
        
        for (int i = 0; i < 3; i++) {
            Map<String, Object> f = new HashMap<>();
            f.put("id", i + 1 + (int)(Math.random() * 1000)); // Unique ID for each search
            f.put("airline", airlines[i % airlines.length]);
            f.put("from", from);
            f.put("to", to);
            f.put("departure", times[i % times.length]);
            f.put("arrival", times[(i + 1) % times.length]);
            f.put("duration", "2h 45m");
            f.put("price", 3500 + (int)(Math.random() * 4000));
            f.put("type", i == 1 ? "Business" : "Economy");
            f.put("tags", i == 0 ? new String[]{"Best Value", "Non-stop"} : (i == 1 ? new String[]{"Premium"} : new String[]{"Cheapest"}));
            flights.add(f);
        }
        
        return ResponseEntity.ok(flights);
    }
    
    @GetMapping("/hotels")
    public ResponseEntity<List<Map<String, Object>>> getHotels(@RequestParam(required = false) String destination) {
        List<Map<String, Object>> hotels = new ArrayList<>();
        
        String dest = destination != null && !destination.isEmpty() ? destination : "Mumbai";
        
        Map<String, Object> h1 = new HashMap<>();
        h1.put("id", 1244451); // Using a specific ID for details page consistency
        h1.put("hotel_id", 1244451);
        h1.put("name", "Taj Mahal Palace");
        h1.put("location", dest);
        h1.put("address", "Apollo Bandar, Colaba, Mumbai, Maharashtra 400001");
        h1.put("city", dest);
        h1.put("distance", "0.5 km from city center");
        h1.put("price", 18500);
        h1.put("rating", 4.9);
        h1.put("reviews", 5420);
        h1.put("image", "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800");
        h1.put("tags", new String[]{"Heritage", "Luxury"});
        hotels.add(h1);
        
        Map<String, Object> h2 = new HashMap<>();
        h2.put("id", 1244452);
        h2.put("hotel_id", 1244452);
        h2.put("name", "ITC Grand Chola");
        h2.put("location", dest);
        h2.put("address", "63, Mount Rd, Guindy, Chennai, Tamil Nadu 600032");
        h2.put("city", dest);
        h2.put("distance", "2.1 km from city center");
        h2.put("price", 12200);
        h2.put("rating", 4.8);
        h2.put("reviews", 3100);
        h2.put("image", "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=800");
        h2.put("tags", new String[]{"Modern", "Luxury"});
        hotels.add(h2);
        
        Map<String, Object> h3 = new HashMap<>();
        h3.put("id", 1244453);
        h3.put("hotel_id", 1244453);
        h3.put("name", "The Leela Palace");
        h3.put("location", dest);
        h3.put("address", "Adyar Sea Face, MRC Nagar, Chennai, Tamil Nadu 600028");
        h3.put("city", dest);
        h3.put("distance", "1.8 km from city center");
        h3.put("price", 15800);
        h3.put("rating", 4.7);
        h3.put("reviews", 2850);
        h3.put("image", "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&q=80&w=800");
        h3.put("tags", new String[]{"Palace", "Quiet"});
        hotels.add(h3);
        
        return ResponseEntity.ok(hotels);
    }
}
