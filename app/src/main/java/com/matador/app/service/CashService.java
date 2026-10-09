package com.matador.app.service;
import java.util.NoSuchElementException;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.UserProfileRepository;

import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import com.matador.app.repository.CashRepository;
import com.matador.app.entity.Cash;
import com.matador.app.dto.CashResponse;
import java.util.Optional;

@Service
public class CashService {

    private CashRepository cashRepository;
    private UserProfileRepository userProfileRepository;

    public CashService(CashRepository cashRepository, UserProfileRepository userProfileRepository) {
        this.cashRepository = cashRepository;
        this.userProfileRepository = userProfileRepository;
    }

    // Method to get cash details for authenticated user
    public CashResponse getCash(String currency) {
        // Get the authenticated user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
        
        // Get the email (username) from the authentication
        String authenticatedEmail = authentication.getName();
        
        // Look up the UserProfile by email
        UserProfile userProfile = userProfileRepository.findByEmail(authenticatedEmail)
            .orElseThrow(() -> new NoSuchElementException("UserProfile not found for email: " + authenticatedEmail));
        
        // Get the cash for this user
        Cash cashEntity = cashRepository.findByUserProfileAndCurrency(userProfile, currency)
            .orElseThrow(() -> new NoSuchElementException("Cash not found for currency: " + currency));
        
        return new CashResponse(cashEntity.getCurrency(), cashEntity.getBalance());
    }

}
