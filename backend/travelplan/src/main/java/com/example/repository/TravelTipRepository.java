package com.example.repository;

import com.example.entity.TravelTip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TravelTipRepository extends JpaRepository<TravelTip, Long> {
    Optional<TravelTip> findByDestinationIgnoreCase(String destination);
}
