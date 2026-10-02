package com.matador.app.dto;
import java.math.BigDecimal;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import com.matador.app.validation.ValidActionType;
import com.matador.app.validation.ValidOrderType;
import com.matador.app.validation.ValidTiming;
import com.matador.app.validation.ValidAssetType;
import com.matador.app.validation.ValidCurrencyCode;

public record OrderRequestDto(
        @NotNull(message = "userId is required")
        Integer userId,

        @NotBlank(message = "ticker is required")
        String ticker,

        @NotNull(message = "assetType is required")
        @ValidAssetType
        String assetType,

        @NotBlank(message = "actionType is required")
        @ValidActionType
        String actionType,

        @NotBlank(message = "orderType is required")
        @ValidOrderType
        String orderType,

        @Positive(message = "quantity must be positive")
        Integer quantity,

        @Positive(message = "price must be positive")
        BigDecimal price,

        @NotBlank(message = "timing is required")
        @ValidTiming
        String timing,

        @NotBlank(message = "currency is required")
        @ValidCurrencyCode
        String currency

) {
    public boolean isBuy() {
        return "BUY".equalsIgnoreCase(actionType);
    }
}
