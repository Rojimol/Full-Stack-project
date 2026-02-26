package com.example;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.example.service.UserService;

import jakarta.annotation.PostConstruct;
@SpringBootApplication
public class TravelplanApplication {
	 @Autowired
	    private UserService userService;
	public static void main(String[] args) {
		SpringApplication.run(TravelplanApplication.class, args);
	}
	@PostConstruct
    public void init() {
        userService.createDefaultAdmin();
    }

}
