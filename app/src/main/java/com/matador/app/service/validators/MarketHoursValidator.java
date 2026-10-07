package com.matador.app.service.validators;

import com.matador.app.dto.OrderRequest;
import com.matador.app.domain.ValidationResult;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Validates market hours for market orders based on asset type.
 * Enforces trading hour restrictions for different asset classes:
 * 
 * - EQUITY: 9:30 AM - 4:00 PM ET (Mon-Fri)
 * 
 * - CRYPTO: 24/7 trading (no restrictions)
 * 
 * - FX: Sunday 5:00 PM ET - Friday 5:00 PM ET
 */
@Component
public class MarketHoursValidator {

    private static final ZoneId ET_ZONE = ZoneId.of("America/New_York");

    /**
     * Validates that the order can be placed considering market hours
     * @param request the order request
     * @return ValidationResult indicating if validation passed
     */
    public ValidationResult validate(OrderRequest request) {
        String assetType = request.assetType().toUpperCase();

        return switch (assetType) {
            case "CRYPTO" -> validateCryptoHours(request);
            case "EQUITY" -> validateEquityHours(request);
            case "FX" -> validateFXHours(request);
            default -> ValidationResult.invalid("Unable to validate market hours for asset type: " + assetType);
        };
    }

    /**
     * Checks if the market is open for a given asset type (for trade execution).
     * 
     * @param assetType the asset type (EQUITY, CRYPTO, FX)
     * @return true if market is open for trading, false otherwise
     */
    public boolean isMarketOpen(String assetType) {
        String type = assetType.toUpperCase();
        
        return switch (type) {
            case "CRYPTO" -> true; // Always open
            case "EQUITY" -> isMarketOpenEquity();
            case "FX" -> isMarketOpenFX();
            default -> false;
        };
    }

    /**
     * Checks if equity markets are open (9:30 AM - 4:00 PM ET, Monday-Friday)
     */
    private boolean isMarketOpenEquity() {
        ZonedDateTime nowET = ZonedDateTime.now(ET_ZONE);
        LocalTime currentTime = nowET.toLocalTime();
        DayOfWeek dayOfWeek = nowET.getDayOfWeek();

        boolean isWeekday = dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
        LocalTime marketOpen = LocalTime.of(9, 30);
        LocalTime marketClose = LocalTime.of(16, 0);
        
        boolean isWithinRegularHours = (currentTime.isAfter(marketOpen) || currentTime.equals(marketOpen)) &&
                                       (currentTime.isBefore(marketClose) || currentTime.equals(marketClose));

        return isWeekday && isWithinRegularHours;
    }

    /**
     * Checks if FX markets are open (Sunday 5:00 PM ET - Friday 5:00 PM ET)
     */
    private boolean isMarketOpenFX() {
        ZonedDateTime nowET = ZonedDateTime.now(ET_ZONE);
        LocalTime currentTime = nowET.toLocalTime();
        DayOfWeek dayOfWeek = nowET.getDayOfWeek();
        LocalTime sessionBoundary = LocalTime.of(17, 0);

        return isMarketOpenFXHelper(dayOfWeek, currentTime, sessionBoundary);
    }

    /**
     * Crypto trades 24/7, no market hours restriction
     */
    private ValidationResult validateCryptoHours(OrderRequest request) {
        return ValidationResult.valid();
    }

    /**
     * Validates equity market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
     */
    private ValidationResult validateEquityHours(OrderRequest request) {
        if (!isMarketOpenEquity()) {
            ZonedDateTime nowET = ZonedDateTime.now(ET_ZONE);
            LocalTime currentTime = nowET.toLocalTime();
            DayOfWeek dayOfWeek = nowET.getDayOfWeek();
            return ValidationResult.invalid(
                String.format("Equity markets are closed (current time: %s ET on %s). Regular hours: 9:30 AM - 4:00 PM ET, Monday-Friday. " +
                    "Market orders can only be placed during market hours.",
                    currentTime, dayOfWeek)
            );
        }
        return ValidationResult.valid();
    }

    /**
     * Validates FX market hours: Sunday 5:00 PM ET - Friday 5:00 PM ET
     */
    private ValidationResult validateFXHours(OrderRequest request) {
        if (!isMarketOpenFX()) {
            ZonedDateTime nowET = ZonedDateTime.now(ET_ZONE);
            LocalTime currentTime = nowET.toLocalTime();
            DayOfWeek dayOfWeek = nowET.getDayOfWeek();
            return ValidationResult.invalid(
                String.format("FX markets are closed (current time: %s ET on %s). FX session runs: Sunday 5:00 PM ET - Friday 5:00 PM ET. " +
                    "Market orders can only be placed during market hours.",
                    currentTime, dayOfWeek)
            );
        }
        return ValidationResult.valid();
    }

    /**
     * Helper method to determine if FX market is open
     * Market is open: Sunday 5:00 PM ET through Friday 5:00 PM ET
     * Market is closed: Friday 5:00 PM ET through Sunday 5:00 PM ET
     */
    private boolean isMarketOpenFXHelper(DayOfWeek dayOfWeek, LocalTime currentTime, LocalTime sessionBoundary) {
        return switch (dayOfWeek) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY -> true; // Always open
            case FRIDAY -> currentTime.isBefore(sessionBoundary); // Open until 5:00 PM ET
            case SATURDAY -> false; // Always closed
            case SUNDAY -> currentTime.isAfter(sessionBoundary) || currentTime.equals(sessionBoundary); // Open after 5:00 PM ET
        };
    }
}
