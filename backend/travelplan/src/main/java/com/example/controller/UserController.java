package com.example.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.User;
import com.example.service.UserService;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {
    
    @Autowired
    private UserService userService;
    
    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        Map<String, Object> response = new HashMap<>();
        try {
            User registeredUser = userService.registerUser(user);
            response.put("success", true);
            response.put("message", "Registration successful");
            response.put("user", registeredUser);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> credentials) {
        Map<String, Object> response = new HashMap<>();
        try {
            String email = credentials.get("email");
            String password = credentials.get("password");
            
            Optional<User> user = userService.loginUser(email, password);
            if (user.isPresent()) {
                response.put("success", true);
                response.put("message", "Login successful");
                response.put("user", user.get());
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid email or password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<Map<String, Object>> sendOTP(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.sendOTP(request.get("email"));
            response.put("success", true);
            response.put("message", "OTP sent successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/forgot-password/verify-otp")
    public ResponseEntity<Map<String, Object>> verifyOTP(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            boolean isValid = userService.verifyOTP(request.get("email"), request.get("otp"));
            if (isValid) {
                response.put("success", true);
                response.put("message", "OTP verified successfully");
                return ResponseEntity.ok(response);
            } else {
                response.put("success", false);
                response.put("message", "Invalid or expired OTP");
                return ResponseEntity.badRequest().body(response);
            }
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.resetPassword(request.get("email"), request.get("password"));
            response.put("success", true);
            response.put("message", "Password reset successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/google-login")
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> request) {
        Map<String, Object> response = new HashMap<>();
        try {
            String token = request.get("token");
            User user = userService.verifyGoogleToken(token);
            
            response.put("success", true);
            response.put("message", "Google login successful");
            response.put("user", user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Google login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<User> getUser(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                  .orElseGet(() -> ResponseEntity.notFound().build());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        try {
            User updatedUser = userService.updateUser(id, user);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            userService.deleteUser(id);
            response.put("success", true);
            response.put("message", "User deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @GetMapping("/stats/count")
    public ResponseEntity<Map<String, Long>> getUserCount() {
        Map<String, Long> response = new HashMap<>();
        response.put("totalUsers", userService.getTotalUsers());
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<List<User>> getUsersByRole(@PathVariable User.UserRole role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }
}