package com.example.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "itineraries")
public class Itinerary {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private Double totalBudget = 0.0;
    private String activities;
    private LocalDateTime createdAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToMany
    @JoinTable(
        name = "itinerary_collaborators",
        joinColumns = @JoinColumn(name = "itinerary_id"),
        inverseJoinColumns = @JoinColumn(name = "user_id")
    )
    private Set<User> collaborators = new HashSet<>();
    
    public Itinerary() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public Double getTotalBudget() { return totalBudget; }
    public void setTotalBudget(Double totalBudget) { this.totalBudget = totalBudget; }
    
    public String getActivities() { return activities; }
    public void setActivities(String activities) { this.activities = activities; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Set<User> getCollaborators() { return collaborators; }
    public void setCollaborators(Set<User> collaborators) { this.collaborators = collaborators; }
}