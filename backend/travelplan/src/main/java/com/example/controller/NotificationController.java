package com.example.controller;

import com.example.entity.Notification;
import com.example.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "http://localhost:5173")
public class NotificationController {

    @Autowired
    private NotificationRepository notificationRepository;
    
    @GetMapping
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(notificationRepository.findAllByOrderByCreatedAtDesc());
    }
    
    @PutMapping("/{id}/read")
    public ResponseEntity<Map<String, Object>> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(notification -> {
            notification.setRead(true);
            notificationRepository.save(notification);
        });
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification marked as read");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/read-all")
    public ResponseEntity<Map<String, Object>> markAllAsRead() {
        List<Notification> notifications = notificationRepository.findAll();
        notifications.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(notifications);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications marked as read");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteNotification(@PathVariable Long id) {
        notificationRepository.deleteById(id);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Notification deleted");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<Map<String, Object>> clearAll() {
        notificationRepository.deleteAll();
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "All notifications cleared");
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        return ResponseEntity.ok(notificationRepository.save(notification));
    }
}
