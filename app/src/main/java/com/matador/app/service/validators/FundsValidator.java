package com.matador.app.service.validators;

import com.matador.app.dto.OrderRequest;
import com.matador.app.domain.ValidationResult;
import com.matador.app.entity.Cash;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.CashRepository;
import com.matador.app.service.FeeCalculator;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * Validates that user has sufficient funds for BUY orders (no partial fills).
 * Checks that:
 * - User has a cash account in the order currency
 * - Cash balance covers the full order cost including estimated trading fees
 * - Prevents partial fills by requiring full amount upfront
 * 
 * Uses FeeCalculator for consistent fee rate lookup across validators and order processors.
 * Fee rates vary by asset type:
 * - EQUITY: 0% (no trading fees)
 * - CRYPTO: 0.35% (crypto exchange fee)
 * - FX: 0.75% (forex spread/commission)
 */
@Component
public class FundsValidator {

    private final CashRepository cashRepository;
    private final FeeCalculator feeCalculator;

    public FundsValidator(CashRepository cashRepository, FeeCalculator feeCalculator) {
        this.cashRepository = cashRepository;
        this.feeCalculator = feeCalculator;
    }

    /**
     * Validates that user has sufficient funds for a BUY order
     * Calculation: requiredFunds = (quantity × price) + (order_cost × asset_type_fee_rate)
     * 
     * Fee rates:
     * - EQUITY: 0%
     * - CRYPTO: 0.35%
     * - FX: 0.75%
     * 
     * @param user the user placing the order
     * @param request the order request
     * @return ValidationResult indicating if validation passed
     */
    public ValidationResult validate(UserProfile user, OrderRequest request) {
        Optional<Cash> cashAccount = cashRepository.findByUserProfileAndCurrency(user, request.currency());

        if (cashAccount.isEmpty()) {
            return ValidationResult.invalid(
                String.format("You don't have a %s cash account. Please deposit or convert to %s first",
                    request.currency(), request.currency())
            );
        }

        Cash account = cashAccount.get();

        // Calculate required funds including asset-type-specific trading fee
        BigDecimal orderCost = request.price().multiply(new BigDecimal(request.quantity()));
        BigDecimal estimatedFee = feeCalculator.calculateFee(orderCost, request.assetType());
        BigDecimal requiredFunds = orderCost.add(estimatedFee);

        if (account.getBalance().compareTo(requiredFunds) < 0) {
            String feePercentage = feeCalculator.getFeeRatePercentage(request.assetType());
            return ValidationResult.invalid(
                String.format("Insufficient funds. You need %.2f %s but only have %.2f %s (order: %.2f %s + %s fee: %.2f %s)",
                    requiredFunds, request.currency(),
                    account.getBalance(), request.currency(),
                    orderCost, request.currency(),
                    feePercentage, estimatedFee, request.currency())
            );
        }

        return ValidationResult.valid();
    }
}
