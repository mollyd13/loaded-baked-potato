package com.matador.app.service;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Centralized fee calculator for all asset types.
 * Provides consistent fee rate lookup and calculation across validators and order processors.
 * 
 * Fee rates:
 * - EQUITY: 0% (no trading fees)
 * - CRYPTO: 0.35% (cryptocurrency exchange fee)
 * - FX: 0.75% (foreign exchange spread/commission)
 * 
 * Used by:
 * - FundsValidator: estimates required funds including fees
 * - OrderExecutionService: calculates actual fees charged on trade execution
 */
@Component
public class FeeCalculator {

    private static final BigDecimal EQUITY_FEE_RATE = new BigDecimal("0.00");     // 0%
    private static final BigDecimal CRYPTO_FEE_RATE = new BigDecimal("0.0035");   // 0.35%
    private static final BigDecimal FX_FEE_RATE = new BigDecimal("0.0075");       // 0.75%
    private static final BigDecimal DEFAULT_FEE_RATE = new BigDecimal("0.001");   // 0.1% fallback

    /**
     * Gets the trading fee rate for a given asset type
     * @param assetType the asset type (EQUITY, CRYPTO, FX)
     * @return the fee rate as a BigDecimal (e.g., 0.0035 for 0.35%)
     */
    public BigDecimal getFeeRateByAssetType(String assetType) {
        if (assetType == null) {
            return DEFAULT_FEE_RATE;
        }
        
        return switch (assetType.toUpperCase()) {
            case "EQUITY" -> EQUITY_FEE_RATE;
            case "CRYPTO" -> CRYPTO_FEE_RATE;
            case "FX" -> FX_FEE_RATE;
            default -> DEFAULT_FEE_RATE;
        };
    }

    /**
     * Calculates the fee amount for a given order cost and asset type
     * @param orderCost the total cost of the order (quantity × price)
     * @param assetType the asset type
     * @return the fee amount (rounded to 2 decimal places)
     */
    public BigDecimal calculateFee(BigDecimal orderCost, String assetType) {
        if (orderCost == null || orderCost.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal feeRate = getFeeRateByAssetType(assetType);
        return orderCost.multiply(feeRate).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calculates the total cost including fees
     * @param orderCost the base order cost (quantity × price)
     * @param assetType the asset type
     * @return total cost (orderCost + fee)
     */
    public BigDecimal calculateTotalCostWithFees(BigDecimal orderCost, String assetType) {
        if (orderCost == null || orderCost.signum() <= 0) {
            return BigDecimal.ZERO;
        }
        
        BigDecimal fee = calculateFee(orderCost, assetType);
        return orderCost.add(fee);
    }

    /**
     * Gets the fee rate as a percentage string for display
     * @param assetType the asset type
     * @return formatted percentage string (e.g., "0.35%" for CRYPTO)
     */
    public String getFeeRatePercentage(String assetType) {
        BigDecimal rate = getFeeRateByAssetType(assetType);
        BigDecimal percentage = rate.multiply(new BigDecimal("100"));
        return percentage.toPlainString() + "%";
    }
}
