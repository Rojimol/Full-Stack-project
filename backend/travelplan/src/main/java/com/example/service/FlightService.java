package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Flight;
import com.example.repository.FlightRepository;

@Service
public class FlightService {
    
    @Autowired
    private FlightRepository flightRepository;
    
    public Flight bookFlight(Flight flight) {
        return flightRepository.save(flight);
    }
    
    public List<Flight> getUserFlights(Long userId) {
        return flightRepository.findByUserId(userId);
    }
    
    public List<Flight> getAllFlights() {
        return flightRepository.findAll();
    }
    
    public List<Flight> getFlightsByItinerary(Long itineraryId) {
        return flightRepository.findByItineraryId(itineraryId);
    }
    
    public List<Flight> searchFlights(String query) {
        return flightRepository.findByDepartureAirportContainingIgnoreCaseOrArrivalAirportContainingIgnoreCase(query, query);
    }
    
    public void cancelFlight(Long id) {
        flightRepository.deleteById(id);
    }
    
    public Flight updateFlightStatus(Long id, String status) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        flight.setBookingStatus(status);
        return flightRepository.save(flight);
    }

    public Flight updateFlight(Long id, Flight updatedFlight) {
        Flight flight = flightRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Flight not found"));
        flight.setAirline(updatedFlight.getAirline());
        flight.setFlightNumber(updatedFlight.getFlightNumber());
        flight.setDepartureAirport(updatedFlight.getDepartureAirport());
        flight.setArrivalAirport(updatedFlight.getArrivalAirport());
        flight.setDepartureTime(updatedFlight.getDepartureTime());
        flight.setArrivalTime(updatedFlight.getArrivalTime());
        flight.setPrice(updatedFlight.getPrice());
        flight.setBookingStatus(updatedFlight.getBookingStatus());
        return flightRepository.save(flight);
    }
    
    public long getTotalFlights() {
        return flightRepository.count();
    }
}