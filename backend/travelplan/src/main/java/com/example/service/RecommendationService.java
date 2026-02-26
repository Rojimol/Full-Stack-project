package com.example.service;

import com.example.entity.Recommendation;
import com.example.repository.RecommendationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationRepository recommendationRepository;

    @PostConstruct
    public void initData() {
        if (recommendationRepository.count() == 0) {
            recommendationRepository.save(new Recommendation("Eiffel Tower Dinner", "Paris", "Dining", "Romantic dinner with a view of the city.", "https://images.unsplash.com/photo-1511739001486-6bfe10ce785f", 4.8, "romantic,view,fine-dining"));
            recommendationRepository.save(new Recommendation("Louvre Private Tour", "Paris", "Activity", "Skip the line and see the Mona Lisa.", "https://images.unsplash.com/photo-1499856871958-5b9627545d1a", 4.7, "art,history,culture"));
            recommendationRepository.save(new Recommendation("Calangute Beach", "Goa", "Activity", "The queen of beaches in North Goa.", "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2", 4.5, "beach,sun,water-sports"));
            recommendationRepository.save(new Recommendation("Dudhsagar Falls", "Goa", "Hidden Gem", "Majestic four-tiered waterfall on the Mandovi River.", "https://images.unsplash.com/photo-1582972236019-ea4af5dee44d", 4.9, "nature,adventure,trekking"));
            recommendationRepository.save(new Recommendation("Rohtang Pass", "Manali", "Activity", "High mountain pass on the eastern Pir Panjal Range.", "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23", 4.6, "snow,mountains,adventure"));
            recommendationRepository.save(new Recommendation("Old Manali Cafe", "Manali", "Dining", "Cozy cafe with local and international cuisine.", "https://images.unsplash.com/photo-1554118811-1e0d58224f24", 4.4, "cafe,local,vibes"));
        }
    }

    public List<Recommendation> getRecommendations(String destination, String category) {
        if (destination != null && !destination.isEmpty()) {
            List<Recommendation> byDest = recommendationRepository.findByDestinationContainingIgnoreCase(destination);
            if (category != null && !category.isEmpty()) {
                return byDest.stream().filter(r -> r.getCategory().equalsIgnoreCase(category)).collect(Collectors.toList());
            }
            return byDest;
        }
        if (category != null && !category.isEmpty()) {
            return recommendationRepository.findByCategory(category);
        }
        return recommendationRepository.findAll();
    }
}
