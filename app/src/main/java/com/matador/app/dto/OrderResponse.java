package com.matador.app.dto;

import java.math.BigDecimal;

// To be displayed on order confirmation page with other derivable info
public record OrderResponse(
    Integer orderId,
    String actionType,         
    String ticker,
    Integer quantity,
    BigDecimal price,
    BigDecimal estimatedFee   // should be calculated like on frontend submission form, and not saved in DB
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
            estimatedFee
        );
    }
}
