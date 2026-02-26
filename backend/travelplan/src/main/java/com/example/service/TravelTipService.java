package com.example.service;

import com.example.entity.TravelTip;
import com.example.repository.TravelTipRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class TravelTipService {

    @Autowired
    private TravelTipRepository travelTipRepository;

    @PostConstruct
    public void initData() {
        if (travelTipRepository.count() == 0) {
            travelTipRepository.save(new TravelTip("Paris", 
                "Visa required for non-EU citizens. Schengen visa applies.", 
                "Keep an eye on belongings in crowded tourist areas.", 
                "Learn basic French phrases like 'Bonjour' and 'Merci'."));
            
            travelTipRepository.save(new TravelTip("Goa", 
                "E-visa available for most nationalities. Check official Indian visa portal.", 
                "Be cautious of strong currents at certain beaches.", 
                "Rent a scooter to explore the hidden beaches of North Goa."));

            travelTipRepository.save(new TravelTip("Manali", 
                "Inner Line Permit may be required for certain remote areas near the border.", 
                "Mountain roads can be tricky during monsoon season.", 
                "Carry warm clothes even in summer as evenings can be chilly."));
        }
    }

    public Optional<TravelTip> getTipByDestination(String destination) {
        return travelTipRepository.findByDestinationIgnoreCase(destination);
    }
}
