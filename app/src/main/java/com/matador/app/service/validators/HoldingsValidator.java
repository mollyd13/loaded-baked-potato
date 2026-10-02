package com.matador.app.service.validators;

import com.matador.app.dto.OrderRequestDto;
import com.matador.app.domain.ValidationResult;
import com.matador.app.entity.Holding;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.HoldingRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Validates that user has sufficient holdings for SELL orders (no partial fills).
 * Checks that:
 * - User owns the ticker
 * - Asset type matches the holding
 * - Quantity owned >= quantity to sell
 * - Currency matches the holding
 */
@Component
public class HoldingsValidator {

    private final HoldingRepository holdingRepository;

    public HoldingsValidator(HoldingRepository holdingRepository) {
        this.holdingRepository = holdingRepository;
    }

    /**
     * Validates that user has sufficient holdings for a SELL order
     * @param user the user placing the order
     * @param request the order request
     * @return ValidationResult indicating if validation passed
     */
    public ValidationResult validate(UserProfile user, OrderRequestDto request) {
        Optional<Holding> holding = holdingRepository.findByUserProfileAndTicker(user, request.ticker());

        if (holding.isEmpty()) {
            return ValidationResult.invalid("You do not own any shares of " + request.ticker());
        }

        Holding userHolding = holding.get();

        // Verify asset type matches
        if (!userHolding.getAssetType().equalsIgnoreCase(request.assetType())) {
            return ValidationResult.invalid("Asset type mismatch for ticker " + request.ticker());
        }

        // Check quantity (no partial fills)
        if (userHolding.getQuantity() < request.quantity()) {
            return ValidationResult.invalid(
                String.format("Insufficient holdings. You own %d shares of %s but are trying to sell %d",
                    userHolding.getQuantity(), request.ticker(), request.quantity())
            );
        }

        // Verify currency matches
        if (!userHolding.getCurrency().equalsIgnoreCase(request.currency())) {
            return ValidationResult.invalid("Currency mismatch for holding " + request.ticker());
        }

        return ValidationResult.valid();
    }
}
