package com.example.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "recommendations")
public class Recommendation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String destination;
    private String category; // e.g., "Activity", "Dining", "Hidden Gem"
    private String description;
    private String imageUrl;
    private Double rating;
    private String tags; // Comma separated tags for matching

    public Recommendation() {}

    public Recommendation(String title, String destination, String category, String description, String imageUrl, Double rating, String tags) {
        this.title = title;
        this.destination = destination;
        this.category = category;
        this.description = description;
        this.imageUrl = imageUrl;
        this.rating = rating;
        this.tags = tags;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
}
