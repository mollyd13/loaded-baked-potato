package com.matador.app.dto;

import com.matador.app.entity.Trade;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TradeResponse(
    Integer tradeId, String ticker, String assetType, String actionType,
    BigDecimal quantity, BigDecimal price, String currency,
    BigDecimal fee, LocalDateTime executedAt
) {
    public static TradeResponse from(Trade t) {
        return new TradeResponse(t.getTradeId(), t.getTicker(), t.getAssetType(),
            t.getActionType(), t.getQuantity(), t.getPrice(), t.getCurrency(),
            t.getFee(), t.getExecutedAt());
    }
}
