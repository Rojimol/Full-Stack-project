package com.example.service;

import com.example.entity.Notification;
import com.example.repository.NotificationRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @PostConstruct
    public void initData() {
        if (notificationRepository.count() == 0) {
            notificationRepository.save(new Notification(null, "booking", "Flight Confirmed", "Your flight to Paris (AF123) is confirmed for Oct 15.", "2h ago", false, null));
            notificationRepository.save(new Notification(null, "weather", "Storm Alert", "Heavy rain expected in Goa tomorrow. Plan accordingly.", "5h ago", false, null));
            notificationRepository.save(new Notification(null, "collaboration", "New Collaborator", "John Doe joined your 'Summer in Europe' itinerary.", "1d ago", true, null));
            notificationRepository.save(new Notification(null, "budget", "Budget Warning", "You've reached 80% of your estimated budget for the Paris trip.", "2d ago", false, null));
        }
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }
}
