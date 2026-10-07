package com.matador.app.dto;

import com.matador.app.entity.Holding;
import java.math.BigDecimal;

public record HoldingResponse(
    Integer holdingId,
    String ticker,
    String assetType,
    BigDecimal quantity,
    String currency,
    BigDecimal averagePrice
) {
    public static HoldingResponse from(Holding holding) {
        return new HoldingResponse(
            holding.getHoldingId(),
            holding.getTicker(),
            holding.getAssetType(),
            holding.getQuantity(),
            holding.getCurrency(),
            holding.getAveragePrice()
        );
    }
}
