package com.matador.app.dto;

import java.math.BigDecimal;

// To be displayed on order confirmation page with other derivable info
public record OrderResponse(
    Integer orderId,
    String actionType,         
    String ticker,
    Integer quantity,
    BigDecimal price,
    BigDecimal estimatedFee,  // should be calculated like on frontend submission form, and not saved in DB
    String orderStatus        // PENDING if market closed, FILLED if executed, REJECTED if execution failed
) {
    public static OrderResponse fromOrder(
            Integer orderId,
            String actionType,
            String ticker,
            Integer quantity,
            BigDecimal price,
            BigDecimal estimatedFee) {
        
        return new OrderResponse(
            orderId,
            actionType,
            ticker,
            quantity,
            price,
            estimatedFee,
            "PENDING"
        );
    }
    
    /**
     * Factory method for responses after execution attempt.
     * Uses actual execution price and fee if trade executed,
     * otherwise uses estimated values from submission.
     */
    public static OrderResponse fromOrderAfterExecution(
            Integer orderId,
            String actionType,
            String ticker,
            Integer quantity,
            BigDecimal price,
            BigDecimal fee,
            String orderStatus) {
        
        return new OrderResponse(
            orderId,
            actionType,
            ticker,
            quantity,
            price,
            fee,
            orderStatus
        );
    }
}
