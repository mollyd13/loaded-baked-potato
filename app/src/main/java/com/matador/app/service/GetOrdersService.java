package com.matador.app.service;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.matador.app.dto.OrderResponse;
import com.matador.app.entity.Order;
import com.matador.app.entity.Trade;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.OrderRepository;
import com.matador.app.repository.TradeRepository;
import java.util.List;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.NoSuchElementException;

@Service 
public class GetOrdersService {

    private final OrderRepository orderRepository;
    private final AuthService authService;
    private final FeeCalculator feeCalculator;
    private final TradeRepository tradeRepository;

    public GetOrdersService(OrderRepository orderRepository, AuthService authService, FeeCalculator feeCalculator, TradeRepository tradeRepository) {
        this.orderRepository = orderRepository;
        this.authService = authService;
        this.feeCalculator = feeCalculator;
        this.tradeRepository = tradeRepository;
    }

    public List<OrderResponse> getAllOrders() {

        UserProfile userProfile = this.getCurrentAuthenticatedUserProfile();

        List<Order> orders = orderRepository.findByUserProfile(userProfile);
        List<OrderResponse> orderResponses = new ArrayList<>();
        BigDecimal fee;
        for (Order order : orders) {
            // if order is filled, get the fee from the executed trade
            if ("FILLED".equals(order.getOrderStatus())) {
                List<Trade> executedTrades = tradeRepository.findByOrder(order);
                //  get the first trade cause we only have one executed trade per order
                if (executedTrades.isEmpty()) {
                    fee = BigDecimal.ZERO; // Fallback if no trade record exists
                } else {
                    fee = executedTrades.get(0).getFee();
                }
            } else {
                BigDecimal orderCost = order.getPrice().multiply(order.getQuantity());
                fee = feeCalculator.calculateFee(orderCost, order.getAssetType());
            }
            orderResponses.add(OrderResponse.fromOrderAfterExecution(order.getOrderId(),
                                                        order.getActionType(),
                                                        order.getTicker(),
                                                        order.getQuantity(),
                                                        order.getPrice(),
                                                        fee,
                                                        order.getOrderStatus()));
        }
        return orderResponses;
    }

    private UserProfile getCurrentAuthenticatedUserProfile() {
        // Get the authenticated user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new SecurityException("User is not authenticated");
        }
        
        // Get the email (username) from the authentication
        String authenticatedEmail = authentication.getName();
        
        // Look up the UserProfile by email
        UserProfile userProfile = authService.findActiveByEmail(authenticatedEmail);

        if (userProfile == null) {
            throw new NoSuchElementException("UserProfile not found for email: " + authenticatedEmail);
        }
        return userProfile;
    }
}
