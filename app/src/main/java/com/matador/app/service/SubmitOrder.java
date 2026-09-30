package com.matador.app.service;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import java.util.NoSuchElementException;

import com.matador.app.dto.OrderRequest;
import com.matador.app.domain.ValidationResult;
import com.matador.app.entity.Order;
import com.matador.app.entity.UserProfile;
import com.matador.app.exception.OrderRejectedException;
import com.matador.app.repository.OrderRepository;
import com.matador.app.repository.UserProfileRepository;

@Service 
public class SubmitOrder {

    private final OrderValidator orderValidator;
    private final OrderRepository orderRepository;
    private final UserProfileRepository userProfileRepository;

    public SubmitOrder(OrderValidator orderValidator, OrderRepository orderRepository, UserProfileRepository userProfileRepository) {
        this.orderValidator = orderValidator;
        this.orderRepository = orderRepository; 
        this.userProfileRepository = userProfileRepository;
    }

    public Order submit(OrderRequest request) {

        // Moved auth check to submission
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
        
        String authenticatedEmail = authentication.getName();
        UserProfile authenticatedUser = userProfileRepository.findByEmail(authenticatedEmail)
            .orElseThrow(() -> new NoSuchElementException("Authenticated user not found: " + authenticatedEmail));


        ValidationResult result = orderValidator.validate(request, authenticatedUser);
        if (!result.isValid()) {
           throw new OrderRejectedException("Order validation failed: " + result.getReason());
        }

        Order order = new Order(authenticatedUser,
            request.ticker(),
            request.assetType(),
            request.actionType(),
            request.orderType(), 
            request.quantity(),
            request.price(),
            request.timing(),
            "PENDING",
            java.time.LocalDateTime.now(),
            request.currency()
        );

        return orderRepository.save(order);
    }
}