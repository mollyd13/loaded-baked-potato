package com.matador.app.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.matador.app.dto.OrderRequest;
import com.matador.app.dto.OrderResponse;
import com.matador.app.entity.Order;
import com.matador.app.service.SubmitOrder;
import com.matador.app.service.FeeCalculator;
import com.matador.app.service.PricingService;
import java.math.BigDecimal;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final SubmitOrder submitOrderService;
    private final FeeCalculator feeCalculator;

    public OrderController(SubmitOrder submitOrderService, FeeCalculator feeCalculator, PricingService pricingService) {
        this.submitOrderService = submitOrderService;
        this.feeCalculator = feeCalculator;
    }

    @PostMapping
    public ResponseEntity<?> submitOrder(@Valid @RequestBody OrderRequest request) {
        // Returns OrderResponse DTO for frontend order confirmation with ESTIMATED price and fee
        try {
            Order savedOrder = submitOrderService.submit(request);
            
            BigDecimal submissionPrice = request.price();
            
            BigDecimal orderCost = submissionPrice.multiply(new BigDecimal(savedOrder.getQuantity()));
            
            BigDecimal estimatedFee = feeCalculator.calculateFee(orderCost, savedOrder.getAssetType());
            
            OrderResponse response = OrderResponse.fromOrder(
                savedOrder.getOrderId(),
                savedOrder.getActionType(),
                savedOrder.getTicker(),
                savedOrder.getQuantity(),
                submissionPrice,
                estimatedFee
            );
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Order submission failed: " + e.getMessage());
        }
    }
}

