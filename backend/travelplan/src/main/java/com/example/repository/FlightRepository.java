package com.example.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.entity.Flight;

public interface FlightRepository extends JpaRepository<Flight, Long> {
    List<Flight> findByUserId(Long userId);
    List<Flight> findByItineraryId(Long itineraryId);
    List<Flight> findByDepartureAirportContainingIgnoreCaseOrArrivalAirportContainingIgnoreCase(String departure, String arrival);
}