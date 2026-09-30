package com.matador.app.service;

import com.matador.app.dto.OrderRequest;
import com.matador.app.domain.ValidationResult;
import com.matador.app.entity.UserProfile;
import com.matador.app.service.validators.FundsValidator;
import com.matador.app.service.validators.HoldingsValidator;
import com.matador.app.service.validators.MarketHoursValidator;
import com.matador.app.service.validators.UserValidator;
import org.springframework.stereotype.Service;

/**
 * Orchestrator for order validation using the Strategy pattern.
 * Coordinates multiple validators to ensure orders meet all business requirements:
 * 
 * Validation sequence:
 * 1. User exists and is active (UserValidator)
 * 2. User has sufficient holdings for SELL orders (HoldingsValidator)
 * 3. User has sufficient funds for BUY orders (FundsValidator)
 * 4. Order can be placed during market hours (MarketHoursValidator)
 * 
 * Structural validation (field values, formats) is handled at the DTO layer
 * using custom Jakarta Bean Validation annotations.
 */
@Service
public class OrderValidator {

    private final UserValidator userValidator;
    private final HoldingsValidator holdingsValidator;
    private final FundsValidator fundsValidator;
    private final MarketHoursValidator marketHoursValidator;

    public OrderValidator(UserValidator userValidator,
                          HoldingsValidator holdingsValidator,
                          FundsValidator fundsValidator,
                          MarketHoursValidator marketHoursValidator) {
        this.userValidator = userValidator;
        this.holdingsValidator = holdingsValidator;
        this.fundsValidator = fundsValidator;
        this.marketHoursValidator = marketHoursValidator;
    }

    /**
     * Validates an order request against all business rules.
     * Returns the first validation error encountered.
     * 
     * @param request the order request to validate
     * @return ValidationResult indicating success or specific failure reason
     */
    public ValidationResult validate(OrderRequest request) {
        
        // 1. Validate user exists and is active
        ValidationResult userValidation = userValidator.validate(request.userId());
        if (!userValidation.isValid()) {
            return userValidation;
        }

        // Get validated user for subsequent checks
        UserProfile user = userValidator.getValidUser(request.userId());

        // 2. For SELL orders: validate sufficient holdings
        if (!request.isBuy()) {
            ValidationResult holdingValidation = holdingsValidator.validate(user, request);
            if (!holdingValidation.isValid()) {
                return holdingValidation;
            }
        }

        // 3. For BUY orders: validate sufficient funds
        if (request.isBuy()) {
            ValidationResult fundsValidation = fundsValidator.validate(user, request);
            if (!fundsValidation.isValid()) {
                return fundsValidation;
            }
        }

        // 4. Validate market hours for order placement
        ValidationResult marketHoursValidation = marketHoursValidator.validate(request);
        if (!marketHoursValidation.isValid()) {
            return marketHoursValidation;
        }

        return ValidationResult.valid();
    }
}
