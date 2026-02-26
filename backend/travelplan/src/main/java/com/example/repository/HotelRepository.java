package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.Hotel;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findByUserId(Long userId);
    List<Hotel> findByItineraryId(Long itineraryId);
    List<Hotel> findByLocationContainingIgnoreCase(String location);
}