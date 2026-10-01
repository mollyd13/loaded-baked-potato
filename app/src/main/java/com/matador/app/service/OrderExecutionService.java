package com.matador.app.service;

import com.matador.app.entity.Cash;
import com.matador.app.entity.Holding;
import com.matador.app.entity.Order;
import com.matador.app.entity.Trade;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.CashRepository;
import com.matador.app.repository.OrderRepository;
import com.matador.app.repository.TradeRepository;
import com.matador.app.repository.UserProfileRepository;
import com.matador.app.service.HoldingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

/**
 * Processes pending orders and executes trades.
 * Applies actual trading fees based on asset type using FeeCalculator.
 * 
 * Responsibilities:
 * 1. Retrieve PENDING orders from database
 * 2. Check market hours for execution eligibility
 * 3. Calculate actual fees using FeeCalculator
 * 4. Create Trade entity with actual fee charged
 * 5. Update user cash balance with executed price and fee
 * 6. Update user holdings with new shares/assets
 * 7. Mark order as FILLED/REJECTED based on execution result
 * 
 * Fee rates (applied at execution time):
 * - EQUITY: 0% (no trading fees)
 * - CRYPTO: 0.35% (cryptocurrency exchange fee)
 * - FX: 0.75% (foreign exchange spread/commission)
 */
@Service
public class OrderExecutionService {

    private final OrderRepository orderRepository;
    private final TradeRepository tradeRepository;
    private final CashRepository cashRepository;
    private final UserProfileRepository userProfileRepository;
    private final FeeCalculator feeCalculator;
    private final HoldingService holdingService;

    public OrderExecutionService(OrderRepository orderRepository,
                                 TradeRepository tradeRepository,
                                 CashRepository cashRepository,
                                 UserProfileRepository userProfileRepository,
                                 FeeCalculator feeCalculator,
                                 HoldingService holdingService) {
        this.orderRepository = orderRepository;
        this.tradeRepository = tradeRepository;
        this.cashRepository = cashRepository;
        this.userProfileRepository = userProfileRepository;
        this.feeCalculator = feeCalculator;
        this.holdingService = holdingService;
    }

    /**
     * Executes a single trade from a pending order.
     * Calculates actual fees, creates trade record, and updates user balances.
     * 
     * @param order the pending order to execute
     * @return Trade entity if execution successful, null if execution fails
     */
    @Transactional
    public Trade executeTrade(Order order) {
        // TODO: Implementation notes
        // 1. Verify order status is PENDING
        if (!order.getOrderStatus().equals("PENDING")) {
            throw new IllegalStateException("Order must be PENDING to execute. Status: " + order.getOrderStatus());
        }

        // 2. Check if market is open for this asset type
        // (Use MarketHoursValidator or similar logic)
        // if (!isMarketOpen(order.getAssetType())) {
        //     return null; // Skip execution, market closed
        // }

        // 3. Get user and their cash account
        UserProfile user = order.getUserProfile();
        Optional<Cash> cashAccount = cashRepository.findByUserProfileAndCurrency(user, order.getCurrency());
        if (cashAccount.isEmpty()) {
            markOrderAsRejected(order, "Cash account not found for currency: " + order.getCurrency());
            return null;
        }

        // 4. Calculate order cost and actual fee
        BigDecimal orderCost = order.getPrice().multiply(new BigDecimal(order.getQuantity()));
        BigDecimal actualFee = feeCalculator.calculateFee(orderCost, order.getAssetType());
        BigDecimal totalCost;

        // 5. Execute based on order action (BUY or SELL)
        if (order.getActionType().equalsIgnoreCase("BUY")) {
            totalCost = orderCost.add(actualFee);
            return executeBuyTrade(order, user, cashAccount.get(), actualFee, totalCost);
        } else if (order.getActionType().equalsIgnoreCase("SELL")) {
            return executeSellTrade(order, user, actualFee);
        } else {
            markOrderAsRejected(order, "Invalid action type: " + order.getActionType());
            return null;
        }
    }

    /**
     * Executes a BUY order.
     * - Debits cash account by (order_cost + fee)
     * - Credits holding with new shares
     * - Creates Trade record with actual fee
     */
    private Trade executeBuyTrade(Order order, UserProfile user, Cash cashAccount,
                                  BigDecimal actualFee, BigDecimal totalCost) {
        // TODO: Full implementation
        // 1. Verify sufficient funds (should have been validated)
        if (cashAccount.getBalance().compareTo(totalCost) < 0) {
            markOrderAsRejected(order, "Insufficient funds at execution time");
            return null;
        }

        // 2. Create Trade entity
        Trade trade = new Trade(
            order,
            user,
            order.getTicker(),
            order.getAssetType(),
            order.getActionType(),
            order.getQuantity(),
            order.getPrice(),
            order.getCurrency(),
            actualFee,
            LocalDateTime.now()
        );

        // 3. Update cash balance (debit order cost and fee)
        cashAccount.setBalance(cashAccount.getBalance().subtract(totalCost));
        cashRepository.save(cashAccount);

        // 4. Update or create holding
        // - If user already owns the ticker, update quantity and average price
        // - If new holding, create it
        Optional<Holding> existingHolding = holdingService.getHoldingByTicker(user, order.getTicker());
        if (existingHolding.isPresent()) {
            holdingService.updateHoldingOnBuy(existingHolding.get(), order.getQuantity(), order.getPrice());
        } else {
            holdingService.createHolding(user, order.getTicker(), order.getAssetType(), 
                                        order.getQuantity(), order.getCurrency(), order.getPrice());
        }
        
        // 5. Save trade
        tradeRepository.save(trade);

        // 6. Update order status to FILLED
        order.setOrderStatus("FILLED");
        orderRepository.save(order);

        return trade;
    }

    /**
     * Executes a SELL order.
     * - Debits holding by quantity sold
     * - Credits cash account by (proceeds - fee)
     * - Creates Trade record with actual fee
     */
    private Trade executeSellTrade(Order order, UserProfile user, BigDecimal actualFee) {
        // TODO: Full implementation
        // 1. Verify user owns sufficient shares (should have been validated)
        Optional<Holding> holding = holdingService.getHoldingByTicker(user, order.getTicker());
        if (holding.isEmpty() || holding.get().getQuantity() < order.getQuantity()) {
            markOrderAsRejected(order, "Insufficient holdings at execution time");
            return null;
        }

        // 2. Create Trade entity
        Trade trade = new Trade(
            order,
            user,
            order.getTicker(),
            order.getAssetType(),
            order.getActionType(),
            order.getQuantity(),
            order.getPrice(),
            order.getCurrency(),
            actualFee,
            LocalDateTime.now()
        );

        // 3. Calculate proceeds (price - fee, fee is deducted from sale proceeds)
        BigDecimal grossProceeds = order.getPrice().multiply(new BigDecimal(order.getQuantity()));
        BigDecimal netProceeds = grossProceeds.subtract(actualFee);

        // 4. Update cash balance (credit with net proceeds)
        Optional<Cash> cashAccount = cashRepository.findByUserProfileAndCurrency(user, order.getCurrency());
        if (cashAccount.isEmpty()) {
            markOrderAsRejected(order, "Cash account not found for currency: " + order.getCurrency());
            return null;
        }

        cashAccount.get().setBalance(cashAccount.get().getBalance().add(netProceeds));
        cashRepository.save(cashAccount.get());

        // 5. Update holding (reduce quantity)
        holdingService.updateHoldingOnSell(holding.get(), order.getQuantity());

        // 6. Save trade
        tradeRepository.save(trade);

        // 7. Update order status to FILLED
        order.setOrderStatus("FILLED");
        orderRepository.save(order);

        return trade;
    }

    /**
     * Marks an order as rejected with a reason.
     * Called when order cannot be executed despite passing validation.
     */
    private void markOrderAsRejected(Order order, String reason) {
        order.setOrderStatus("REJECTED");
        orderRepository.save(order);
        // TODO: Optionally log rejection reason to a rejection_reason column or audit table
    }

    /**
     * Example: Schedule this to run periodically (e.g., via @Scheduled)
     * to process all pending orders that are eligible for execution
     */
    // @Scheduled(fixedRate = 1000) // Run every second
    // public void processAllPendingOrders() {
    //     List<Order> pendingOrders = orderRepository.findByOrderStatus("PENDING");
    //     for (Order order : pendingOrders) {
    //         try {
    //             executeTrade(order);
    //         } catch (Exception e) {
    //             markOrderAsRejected(order, "Execution error: " + e.getMessage());
    //         }
    //     }
    // }
}
