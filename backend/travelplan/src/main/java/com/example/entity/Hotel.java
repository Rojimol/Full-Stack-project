package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "hotels")
public class Hotel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String hotelName;
    private String location;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private Double pricePerNight = 0.0;
    private Integer roomCount = 1;
    private String amenities;
    private String bookingStatus = "PENDING";
    private LocalDateTime bookedAt;
    
    @ManyToOne
    @JoinColumn(name = "itinerary_id")
    private Itinerary itinerary;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    public Hotel() {
        this.bookedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getHotelName() { return hotelName; }
    public void setHotelName(String hotelName) { this.hotelName = hotelName; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }
    
    public LocalDate getCheckIn() { return checkIn; }
    public void setCheckIn(LocalDate checkIn) { this.checkIn = checkIn; }
    
    public LocalDate getCheckOut() { return checkOut; }
    public void setCheckOut(LocalDate checkOut) { this.checkOut = checkOut; }
    
    public Double getPricePerNight() { return pricePerNight; }
    public void setPricePerNight(Double pricePerNight) { this.pricePerNight = pricePerNight; }
    
    public Integer getRoomCount() { return roomCount; }
    public void setRoomCount(Integer roomCount) { this.roomCount = roomCount; }
    
    public String getAmenities() { return amenities; }
    public void setAmenities(String amenities) { this.amenities = amenities; }
    
    public String getBookingStatus() { return bookingStatus; }
    public void setBookingStatus(String bookingStatus) { this.bookingStatus = bookingStatus; }
    
    public LocalDateTime getBookedAt() { return bookedAt; }
    public void setBookedAt(LocalDateTime bookedAt) { this.bookedAt = bookedAt; }
    
    public Itinerary getItinerary() { return itinerary; }
    public void setItinerary(Itinerary itinerary) { this.itinerary = itinerary; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
}