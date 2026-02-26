package com.example.repository;

import com.example.entity.Recommendation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RecommendationRepository extends JpaRepository<Recommendation, Long> {
    List<Recommendation> findByDestinationContainingIgnoreCase(String destination);
    List<Recommendation> findByCategory(String category);
}
