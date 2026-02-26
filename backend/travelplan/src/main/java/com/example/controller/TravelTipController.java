package com.example.controller;

import com.example.entity.TravelTip;
import com.example.service.TravelTipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/travel-tips")
@CrossOrigin(origins = "http://localhost:5173")
public class TravelTipController {

    @Autowired
    private TravelTipService travelTipService;

    @GetMapping("/{destination}")
    public ResponseEntity<TravelTip> getTravelTip(@PathVariable String destination) {
        return travelTipService.getTipByDestination(destination)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
