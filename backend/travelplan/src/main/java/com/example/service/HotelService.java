package com.example.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.entity.Hotel;
import com.example.repository.HotelRepository;

@Service
public class HotelService {
    
    @Autowired
    private HotelRepository hotelRepository;
    
    public Hotel bookHotel(Hotel hotel) {
        return hotelRepository.save(hotel);
    }
    
    public List<Hotel> getUserHotels(Long userId) {
        return hotelRepository.findByUserId(userId);
    }
    
    public List<Hotel> getAllHotels() {
        return hotelRepository.findAll();
    }
    
    public List<Hotel> getHotelsByItinerary(Long itineraryId) {
        return hotelRepository.findByItineraryId(itineraryId);
    }
    
    public List<Hotel> searchHotels(String location) {
        return hotelRepository.findByLocationContainingIgnoreCase(location);
    }
    
    public void cancelHotel(Long id) {
        hotelRepository.deleteById(id);
    }
    
    public Hotel updateHotel(Long id, Hotel hotelDetails) {
        Hotel hotel = hotelRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Hotel not found"));
        
        hotel.setHotelName(hotelDetails.getHotelName());
        hotel.setLocation(hotelDetails.getLocation());
        hotel.setCheckIn(hotelDetails.getCheckIn());
        hotel.setCheckOut(hotelDetails.getCheckOut());
        hotel.setPricePerNight(hotelDetails.getPricePerNight());
        hotel.setRoomCount(hotelDetails.getRoomCount());
        hotel.setAmenities(hotelDetails.getAmenities());
        hotel.setBookingStatus(hotelDetails.getBookingStatus());
        
        return hotelRepository.save(hotel);
    }
    
    public long getTotalHotels() {
        return hotelRepository.count();
    }
}