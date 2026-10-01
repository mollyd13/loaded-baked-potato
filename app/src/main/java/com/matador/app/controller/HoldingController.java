package com.matador.app.controller;

import com.matador.app.dto.HoldingResponse;
import com.matador.app.entity.Holding;
import com.matador.app.entity.UserProfile;
import com.matador.app.service.HoldingService;
import com.matador.app.repository.UserProfileRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;


@RestController
@RequestMapping("/holdings")
public class HoldingController {

    private final HoldingService holdingService;
    private final UserProfileRepository userProfileRepository;

    public HoldingController(HoldingService holdingService, UserProfileRepository userProfileRepository) {
        this.holdingService = holdingService;
        this.userProfileRepository = userProfileRepository;
    }

    private UserProfile getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userProfileRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Current user not found"));
    }

    @GetMapping
    public ResponseEntity<?> getHoldings(@RequestParam(required = false) String assetType) {
        try {
            UserProfile user = getCurrentUser();
            List<Holding> holdings;
            
            if (assetType != null && !assetType.isBlank()) {
                holdings = holdingService.getHoldingsByAssetType(user, assetType);
            } else {
                holdings = holdingService.getUserHoldings(user);
            }
            
            List<HoldingResponse> responses = holdings.stream()
                .map(HoldingResponse::from)
                .toList();
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving holdings: " + e.getMessage());
        }
    }

    @GetMapping("/{ticker}")
    public ResponseEntity<?> getHoldingByTicker(@PathVariable String ticker) {
        try {
            UserProfile user = getCurrentUser();
            Optional<Holding> holding = holdingService.getHoldingByTicker(user, ticker);
            
            if (holding.isPresent()) {
                return ResponseEntity.ok(HoldingResponse.from(holding.get()));
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving holding: " + e.getMessage());
        }
    }

    @GetMapping("/currency/{currency}")
    public ResponseEntity<?> getHoldingsByCurrency(@PathVariable String currency) {
        try {
            UserProfile user = getCurrentUser();
            List<Holding> holdings = holdingService.getHoldingsByCurrency(user, currency);
            
            List<HoldingResponse> responses = holdings.stream()
                .map(HoldingResponse::from)
                .toList();
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error retrieving holdings by currency: " + e.getMessage());
        }
    }
}
