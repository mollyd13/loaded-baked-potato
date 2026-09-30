package com.matador.app.service.validators;

import com.matador.app.DTO.OrderRequestDto;
import com.matador.app.domain.ValidationResult;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

/**
 * Validates market hours based on asset type and order timing.
 * Enforces trading hour restrictions for different asset classes:
 * 
 * - EQUITY: 9:30 AM - 4:00 PM ET (Mon-Fri)
 *   - DAY orders rejected outside regular hours
 *   - GTC orders allowed anytime (execute at market open)
 *   - Weekend orders rejected
 * 
 * - CRYPTO: 24/7 trading (no restrictions)
 * 
 * - FX: Sunday 5:00 PM ET - Friday 5:00 PM ET
 *   - Closed Friday 5:00 PM ET - Sunday 5:00 PM ET
 *   - Same restrictions for DAY/GTC orders
 */
@Component
public class MarketHoursValidator {

    private static final ZoneId ET_ZONE = ZoneId.of("America/New_York");

    /**
     * Validates that the order can be placed considering market hours
     * @param request the order request
     * @return ValidationResult indicating if validation passed
     */
    public ValidationResult validate(OrderRequestDto request) {
        String assetType = request.assetType().toUpperCase();

        return switch (assetType) {
            case "CRYPTO" -> validateCryptoHours(request);
            case "EQUITY" -> validateEquityHours(request);
            case "FX" -> validateFXHours(request);
            default -> ValidationResult.invalid("Unable to validate market hours for asset type: " + assetType);
        };
    }

    /**
     * Crypto trades 24/7, no market hours restriction
     */
    private ValidationResult validateCryptoHours(OrderRequestDto request) {
        return ValidationResult.valid();
    }

    /**
     * Validates equity market hours: 9:30 AM - 4:00 PM ET, Monday-Friday
     * DAY orders rejected outside regular hours; GTC allowed anytime (execute at market open)
     */
    private ValidationResult validateEquityHours(OrderRequestDto request) {
        ZonedDateTime nowET = ZonedDateTime.now(ET_ZONE);
        LocalTime currentTime = nowET.toLocalTime();
        DayOfWeek dayOfWeek = nowET.getDayOfWeek();
        String timing = request.timing().toUpperCase();

        boolean isWeekday = dayOfWeek != DayOfWeek.SATURDAY && dayOfWeek != DayOfWeek.SUNDAY;
        
        // Reject DAY orders on weekends; allow GTC orders (they execute at market open)
        if (!isWeekday && timing.equals("DAY")) {
            return ValidationResult.invalid(
                String.format("Equity markets are closed on %s. DAY orders cannot be placed on weekends. " +
                    "Please use GTC (good-til-canceled) timing for weekend orders, which will execute when markets reopen Monday.",
                    dayOfWeek)
            );
        }

        // Check regular trading hours (9:30 AM - 4:00 PM ET)
        LocalTime marketOpen = LocalTime.of(9, 30);
        LocalTime marketClose = LocalTime.of(16, 0);
        boolean isWithinRegularHours = (currentTime.isAfter(marketOpen) || currentTime.equals(marketOpen)) &&
                                       (currentTime.isBefore(marketClose) || currentTime.equals(marketClose));

        if (!isWithinRegularHours && timing.equals("DAY")) {
            return ValidationResult.invalid(
                String.format("Equity markets are closed (current time: %s ET). Regular hours: 9:30 AM - 4:00 PM ET, Monday-Friday. " +
                    "Please place your order during market hours or use GTC timing for after-hours execution.",
                    currentTime)
            );
        }

        // GTC orders can be placed anytime, they'll execute when market opens
        return ValidationResult.valid();
    }

    /**
     * Validates FX market hours: Sunday 5:00 PM ET - Friday 5:00 PM ET
     * Closed: Friday 5:00 PM ET - Sunday 5:00 PM ET
     */
    private ValidationResult validateFXHours(OrderRequestDto request) {
        ZonedDateTime nowET = ZonedDateTime.now(ET_ZONE);
        LocalTime currentTime = nowET.toLocalTime();
        DayOfWeek dayOfWeek = nowET.getDayOfWeek();
        LocalTime sessionBoundary = LocalTime.of(17, 0);

        boolean isMarketOpen = isMarketOpenFX(dayOfWeek, currentTime, sessionBoundary);

        if (!isMarketOpen) {
            return ValidationResult.invalid(
                String.format("FX markets are closed (current time: %s ET on %s). FX session runs: Sunday 5:00 PM ET - Friday 5:00 PM ET. " +
                    "Please wait for market to open.",
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
    private boolean isMarketOpenFX(DayOfWeek dayOfWeek, LocalTime currentTime, LocalTime sessionBoundary) {
        return switch (dayOfWeek) {
            case MONDAY, TUESDAY, WEDNESDAY, THURSDAY -> true; // Always open
            case FRIDAY -> currentTime.isBefore(sessionBoundary); // Open until 5:00 PM ET
            case SATURDAY -> false; // Always closed
            case SUNDAY -> currentTime.isAfter(sessionBoundary) || currentTime.equals(sessionBoundary); // Open after 5:00 PM ET
        };
    }
}
