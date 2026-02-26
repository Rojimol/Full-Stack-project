package com.example.service;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.entity.User;
import com.example.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;

@Service
public class UserService {
    
    private static final String GOOGLE_CLIENT_ID = "966569819409-1lte07n9fubbgi5ep1o1f05c9puh40u6.apps.googleusercontent.com";
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserService.class);
    
    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    public void sendOTP(String email) {
        // Case-insensitive lookup
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("No account found with this email. Please check and try again."));

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(email);
                message.setSubject("Your Password Reset OTP");
                message.setText("Your OTP for password reset is: " + otp + "\nValid for 10 minutes.");
                mailSender.send(message);
                logger.info("OTP sent successfully to {}", email);
            } catch (Exception e) {
                logger.error("Failed to send email to {}: {}", email, e.getMessage());
                // Fallback to console log if email fails
                System.out.println("DEBUG: OTP for " + email + " is " + otp);
            }
        } else {
            logger.warn("JavaMailSender not configured. Printing OTP to console.");
            System.out.println("DEBUG: OTP for " + email + " is " + otp);
        }
    }

    public boolean verifyOTP(String email, String otp) {
        if (email == null) return false;
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getOtp() != null && user.getOtp().equals(otp) && 
            user.getOtpExpiry() != null && user.getOtpExpiry().isAfter(LocalDateTime.now())) {
            return true;
        }
        return false;
    }

    public void resetPassword(String email, String newPassword) {
        if (email == null) return;
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(newPassword);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }
    
    public User verifyGoogleToken(String idTokenString) throws Exception {
        if (idTokenString == null || idTokenString.isEmpty()) {
            throw new IllegalArgumentException("ID token is required.");
        }

        logger.info("Verifying Google token...");
        
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList(GOOGLE_CLIENT_ID))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken != null) {
                Payload payload = idToken.getPayload();
                String email = payload.getEmail();
                
                // Try different name fields
                String name = (String) payload.get("name");
                if (name == null || name.isEmpty()) {
                    String givenName = (String) payload.get("given_name");
                    String familyName = (String) payload.get("family_name");
                    if (givenName != null && familyName != null) {
                        name = givenName + " " + familyName;
                    } else if (givenName != null) {
                        name = givenName;
                    } else {
                        name = email.split("@")[0]; // Fallback to email prefix
                    }
                }

                logger.info("Google login successful for email: {}", email);

                Optional<User> existingUser = userRepository.findByEmail(email);
                if (existingUser.isPresent()) {
                    User user = existingUser.get();
                    // Update name if it was null before
                    if (user.getFullName() == null || user.getFullName().isEmpty()) {
                        user.setFullName(name);
                        return userRepository.save(user);
                    }
                    return user;
                } else {
                    User newUser = new User();
                    newUser.setEmail(email);
                    newUser.setFullName(name);
                    // Use a more secure random password for OAuth users
                    newUser.setPassword("GOOGLE_AUTH_" + java.util.UUID.randomUUID().toString());
                    newUser.setRole(User.UserRole.USER);
                    newUser.setActive(true);
                    return userRepository.save(newUser);
                }
            } else {
                logger.error("Invalid ID token provided.");
                throw new RuntimeException("Invalid Google ID token.");
            }
        } catch (Exception e) {
            logger.error("Error during Google token verification: {}", e.getMessage());
            throw e;
        }
    }
    
    public User registerUser(User user) {
        String normalizedEmail = user.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new RuntimeException("Email already exists");
        }
        user.setEmail(normalizedEmail);
        return userRepository.save(user);
    }
    
    public Optional<User> loginUser(String email, String password) {
        if (email == null) {
            logger.warn("Login attempt with null email");
            return Optional.empty();
        }
        
        String normalizedEmail = email.toLowerCase().trim();
        String normalizedPassword = password.trim();
        logger.info("Login attempt for email: [{}]", normalizedEmail);
        
        Optional<User> user = userRepository.findByEmail(normalizedEmail);
        
        if (user.isPresent()) {
            logger.info("User found in database: [{}]", user.get().getEmail());
            if (user.get().getPassword().equals(normalizedPassword)) {
                logger.info("Password matched for user: {}", normalizedEmail);
                return user;
            } else {
                logger.warn("Password mismatch for user: {}", normalizedEmail);
                // For debugging, don't log the actual password in production
                logger.debug("DB Password: [{}], Input Password: [{}]", user.get().getPassword(), password);
            }
        } else {
            logger.warn("No user found in database with email: [{}]", normalizedEmail);
        }
        return Optional.empty();
    }
    
    public void createDefaultAdmin() {
        if (!userRepository.existsByEmail("admin@travel.com")) {
            User admin = new User();
            admin.setEmail("admin@travel.com");
            admin.setPassword("Admin@123");
            admin.setFullName("Administrator");
            admin.setRole(User.UserRole.ADMIN);
            admin.setBudget(0.0);
            userRepository.save(admin);
            System.out.println("✓ Default admin created: admin@travel.com / Admin@123");
        }
    }
    
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
    
    public List<User> getUsersByRole(User.UserRole role) {
        return userRepository.findByRole(role);
    }
    
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }
    
    public User updateUser(Long id, User userDetails) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setFullName(userDetails.getFullName());
        user.setPhone(userDetails.getPhone());
        user.setCountry(userDetails.getCountry());
        user.setPreferences(userDetails.getPreferences());
        user.setBudget(userDetails.getBudget());
        user.setRole(userDetails.getRole());
        user.setActive(userDetails.isActive());
        
        return userRepository.save(user);
    }
    
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
    
    public long getTotalUsers() {
        return userRepository.count();
    }
}