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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
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

    private static final Logger log = LoggerFactory.getLogger(OrderExecutionService.class);

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
     * Entry point for the OrderAcceptedEvent consumer. Idempotent: delivering the
     * same order id twice executes it once.
     * - The order row is locked, so a concurrent duplicate waits for the first to finish.
     * - Anything no longer PENDING (FILLED/REJECTED) is skipped and nothing changes.
     *
     * REQUIRES_NEW because the consumer runs after the submitting transaction has committed.
     *
     * @return the Trade if this call executed the order, null if it was skipped or rejected
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Trade executeOrder(Integer orderId) {
        Optional<Order> order = orderRepository.findByIdForUpdate(orderId);
        if (order.isEmpty()) {
            log.warn("Order {} not found, ignoring event", orderId);
            return null;
        }
        if (!"PENDING".equals(order.get().getOrderStatus())) {
            log.info("Order {} already {}, ignoring duplicate event", orderId, order.get().getOrderStatus());
            return null;
        }
        return executeTrade(order.get());
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
