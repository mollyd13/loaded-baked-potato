package com.matador.app.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.matador.app.DTO.OrderRequestDto;
import com.matador.app.entity.Order;
import com.matador.app.service.SubmitOrder;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final SubmitOrder submitOrderService;

    public OrderController(SubmitOrder submitOrderService) {
        this.submitOrderService = submitOrderService;
    }

    @PostMapping
    public ResponseEntity<String> submitOrder(@Valid @RequestBody OrderRequestDto dto) {
        try {
            Order savedOrder = submitOrderService.submit(dto);
            return ResponseEntity.ok("Order " + savedOrder.getOrderId() + " submitted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Order submission failed: " + e.getMessage());
        }
    }
}
