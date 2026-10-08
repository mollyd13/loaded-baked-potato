package com.matador.app.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.matador.app.dto.OrderRequest;
import com.matador.app.dto.OrderResponse;
import com.matador.app.entity.Order;
import com.matador.app.entity.Trade;
import com.matador.app.repository.OrderRepository;
import com.matador.app.service.SubmitOrder;
import com.matador.app.service.FeeCalculator;
import com.matador.app.service.PricingService;
import com.matador.app.service.OrderExecutionService;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final SubmitOrder submitOrderService;
    private final FeeCalculator feeCalculator;
    private final OrderExecutionService orderExecutionService;
    private final OrderRepository orderRepository;

    public OrderController(SubmitOrder submitOrderService, FeeCalculator feeCalculator, 
                          PricingService pricingService, OrderExecutionService orderExecutionService,
                          OrderRepository orderRepository) {
        this.submitOrderService = submitOrderService;
        this.feeCalculator = feeCalculator;
        this.orderExecutionService = orderExecutionService;
        this.orderRepository = orderRepository;
    }

    @PostMapping
    public ResponseEntity<?> submitOrder(@Valid @RequestBody OrderRequest request) {
        // Submits order and attempts immediate execution
        // Returns with actual execution price/fee if filled, or estimated price/fee if pending/rejected
        try {
            Order savedOrder = submitOrderService.submit(request);
            
            BigDecimal submissionPrice = request.price();
            BigDecimal orderCost = submissionPrice.multiply(savedOrder.getQuantity());
            BigDecimal estimatedFee = feeCalculator.calculateFee(orderCost, savedOrder.getAssetType());
            
            // Attempt to execute trade immediately
            Trade executedTrade = orderExecutionService.executeTrade(savedOrder);
            
            OrderResponse response;
            if (executedTrade != null) {
                // Trade executed successfully - use actual execution price and fee
                response = OrderResponse.fromOrderAfterExecution(
                    savedOrder.getOrderId(),
                    savedOrder.getActionType(),
                    savedOrder.getTicker(),
                    savedOrder.getQuantity(),
                    executedTrade.getPrice(),
                    executedTrade.getFee(),
                    savedOrder.getOrderStatus()  // FILLED
                );
            } else {
                // Trade not executed (market closed or execution failed)
                // Refresh order from DB to get updated status (PENDING if market closed, REJECTED if failed)
                Order updatedOrder = orderRepository.findById(savedOrder.getOrderId()).orElse(savedOrder);
                response = OrderResponse.fromOrderAfterExecution(
                    updatedOrder.getOrderId(),
                    updatedOrder.getActionType(),
                    updatedOrder.getTicker(),
                    updatedOrder.getQuantity(),
                    submissionPrice,
                    estimatedFee,
                    updatedOrder.getOrderStatus()
                );
            }
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Order submission failed: " + e.getMessage());
        }
    }
}

