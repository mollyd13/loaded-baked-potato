package com.matador.app.service;
import org.springframework.stereotype.Service;
import java.util.NoSuchElementException;

import com.matador.app.DTO.OrderRequestDto;
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

    public Order submit(OrderRequestDto request) {

        // validate
        ValidationResult result = orderValidator.validate(request);
        if (!result.isValid()) {
           throw new OrderRejectedException("Order validation failed: " + result.getReason());
        }

        // mock user profile for now
        UserProfile user = userProfileRepository.findById(request.userId()).orElseThrow(() -> new NoSuchElementException("User not found: " + request.userId()));

        // create order from dto
        Order order = new Order(user,
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

        //save order to repository
        return orderRepository.save(order);
    }
}