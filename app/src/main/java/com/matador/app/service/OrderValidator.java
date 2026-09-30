package com.matador.app.service;

import com.matador.app.dto.OrderRequest;
import com.matador.app.domain.ValidationResult;
import com.matador.app.entity.UserProfile;
import com.matador.app.service.validators.FundsValidator;
import com.matador.app.service.validators.HoldingsValidator;
import com.matador.app.service.validators.MarketHoursValidator;
import com.matador.app.service.validators.UserValidator;
import org.springframework.stereotype.Service;


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


    public ValidationResult validate(OrderRequest request, UserProfile user) {
        
        // User already authenticated in order submission

        // SELL orders: validate sufficient holdings
        if (!request.isBuy()) {
            ValidationResult holdingValidation = holdingsValidator.validate(user, request);
            if (!holdingValidation.isValid()) {
                return holdingValidation;
            }
        }

        // BUY orders: validate sufficient funds
        if (request.isBuy()) {
            ValidationResult fundsValidation = fundsValidator.validate(user, request);
            if (!fundsValidation.isValid()) {
                return fundsValidation;
            }
        }

        // Validate market hours for order placement
        ValidationResult marketHoursValidation = marketHoursValidator.validate(request);
        if (!marketHoursValidation.isValid()) {
            return marketHoursValidation;
        }

        return ValidationResult.valid();
    }
}
