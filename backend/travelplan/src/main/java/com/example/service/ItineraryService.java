package com.example.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Itinerary;
import com.example.entity.User;
import com.example.repository.ItineraryRepository;
import com.example.repository.UserRepository;

@Service
public class ItineraryService {
    
    @Autowired
    private ItineraryRepository itineraryRepository;

    @Autowired
    private UserRepository userRepository;
    
    public Itinerary createItinerary(Itinerary itinerary) {
        return itineraryRepository.save(itinerary);
    }
    
    public List<Itinerary> getUserItineraries(Long userId) {
        List<Itinerary> owned = itineraryRepository.findByUserId(userId);
        List<Itinerary> collaborated = itineraryRepository.findByCollaboratorsId(userId);
        owned.addAll(collaborated);
        return owned;
    }

    public Itinerary addCollaborator(Long itineraryId, String email) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
            .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
        
        itinerary.getCollaborators().add(user);
        return itineraryRepository.save(itinerary);
    }

    public Itinerary removeCollaborator(Long itineraryId, Long userId) {
        Itinerary itinerary = itineraryRepository.findById(itineraryId)
            .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        
        itinerary.getCollaborators().removeIf(u -> u.getId().equals(userId));
        return itineraryRepository.save(itinerary);
    }
    
    public List<Itinerary> getAllItineraries() {
        return itineraryRepository.findAll();
    }
    
    public List<Itinerary> searchItineraries(String destination) {
        return itineraryRepository.findByDestinationContainingIgnoreCase(destination);
    }
    
    public Itinerary updateItinerary(Long id, Itinerary itineraryDetails) {
        Itinerary itinerary = itineraryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        
        itinerary.setTitle(itineraryDetails.getTitle());
        itinerary.setDescription(itineraryDetails.getDescription());
        itinerary.setDestination(itineraryDetails.getDestination());
        itinerary.setStartDate(itineraryDetails.getStartDate());
        itinerary.setEndDate(itineraryDetails.getEndDate());
        itinerary.setTotalBudget(itineraryDetails.getTotalBudget());
        itinerary.setActivities(itineraryDetails.getActivities());
        
        return itineraryRepository.save(itinerary);
    }
    
    public void deleteItinerary(Long id) {
        itineraryRepository.deleteById(id);
    }
    
    public Optional<Itinerary> getItineraryById(Long id) {
        return itineraryRepository.findById(id);
    }
    
    public long getTotalItineraries() {
        return itineraryRepository.count();
    }
    
    public Itinerary duplicateItinerary(Long id) {
        Itinerary original = itineraryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Itinerary not found"));
        
        Itinerary copy = new Itinerary();
        copy.setTitle(original.getTitle() + " (Copy)");
        copy.setDescription(original.getDescription());
        copy.setDestination(original.getDestination());
        copy.setStartDate(original.getStartDate());
        copy.setEndDate(original.getEndDate());
        copy.setTotalBudget(original.getTotalBudget());
        copy.setActivities(original.getActivities());
        copy.setUser(original.getUser());
        
        return itineraryRepository.save(copy);
    }
}
