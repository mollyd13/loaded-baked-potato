package com.matador.app.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record OrderRequestDto(
        @NotNull(message = "userId is required")
        String userId,

        @NotBlank(message = "ticker is required")
        String ticker,

        @NotNull(message = "assetType is required")
        String assetType,

        @NotBlank(message = "actionType is required")
        String actionType,

        @NotBlank(message = "orderType is required")
        String orderType,

        @Positive(message = "quantity must be positive")
        double quantity,

        @Positive(message = "price must be positive")
        double price,

        @NotBlank(message = "currency is required")
        String currency

) {
    public boolean isBuy() {
        return "BUY".equalsIgnoreCase(actionType);
    }
}
