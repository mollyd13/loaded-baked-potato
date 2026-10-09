package com.matador.app.dto;
import java.math.BigDecimal;

public record CashResponse(
    String currency,
    BigDecimal balance
) {
}
