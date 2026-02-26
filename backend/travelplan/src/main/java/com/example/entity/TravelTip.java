package com.example.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "travel_tips")
public class TravelTip {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String destination;
    
    @Column(columnDefinition = "TEXT")
    private String visaInfo;
    
    @Column(columnDefinition = "TEXT")
    private String safetyAlerts;
    
    @Column(columnDefinition = "TEXT")
    private String generalTips;
    
    public TravelTip() {}
    
    public TravelTip(String destination, String visaInfo, String safetyAlerts, String generalTips) {
        this.destination = destination;
        this.visaInfo = visaInfo;
        this.safetyAlerts = safetyAlerts;
        this.generalTips = generalTips;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }
    public String getVisaInfo() { return visaInfo; }
    public void setVisaInfo(String visaInfo) { this.visaInfo = visaInfo; }
    public String getSafetyAlerts() { return safetyAlerts; }
    public void setSafetyAlerts(String safetyAlerts) { this.safetyAlerts = safetyAlerts; }
    public String getGeneralTips() { return generalTips; }
    public void setGeneralTips(String generalTips) { this.generalTips = generalTips; }
}
