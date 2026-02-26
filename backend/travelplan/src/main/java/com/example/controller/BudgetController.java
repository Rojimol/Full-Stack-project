package com.example.controller;

import com.example.entity.Budget;
import com.example.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Optional;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {

    @Autowired
    private BudgetRepository budgetRepository;

    @GetMapping("/{userId}")
    public ResponseEntity<Budget> getBudget(@PathVariable Long userId) {
        Budget budget = budgetRepository.findByUserId(userId)
                .orElseGet(() -> {
                    Budget newBudget = new Budget();
                    newBudget.setUserId(userId);
                    newBudget.setEstimated(0.0);
                    newBudget.setExpenses(new ArrayList<>());
                    return budgetRepository.save(newBudget);
                });
        return ResponseEntity.ok(budget);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Budget> updateBudget(@PathVariable Long userId, @RequestBody Budget budgetData) {
        Budget budget = budgetRepository.findByUserId(userId)
                .orElse(new Budget());
        
        budget.setUserId(userId);
        budget.setEstimated(budgetData.getEstimated());
        
        if (budget.getExpenses() != null) {
            budget.getExpenses().clear();
            budget.getExpenses().addAll(budgetData.getExpenses());
        } else {
            budget.setExpenses(budgetData.getExpenses());
        }
        
        return ResponseEntity.ok(budgetRepository.save(budget));
    }
}
