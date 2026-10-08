package com.matador.app;

import com.matador.app.entity.*;
import com.matador.app.repository.*;
import com.matador.app.service.*;
import com.matador.app.service.validators.MarketHoursValidator;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Demonstrates what happens when the consumer sees the same message twice:
 * the first delivery fills the order, the second is ignored.
 */
class DuplicateMessageTest {

    @Test
    void sameMessageTwiceExecutesOnce() {
        OrderRepository orderRepo = mock(OrderRepository.class);
        TradeRepository tradeRepo = mock(TradeRepository.class);
        CashRepository cashRepo = mock(CashRepository.class);
        HoldingRepository holdingRepo = mock(HoldingRepository.class);

        OrderExecutionService service = new OrderExecutionService(
            orderRepo, tradeRepo, cashRepo, mock(UserProfileRepository.class),
            new FeeCalculator(), new HoldingService(holdingRepo),
            mock(PricingService.class), mock(MarketHoursValidator.class));

        UserProfile user = new UserProfile();
        Cash cash = new Cash(user, "USD", new BigDecimal("10000.00"));
        Order order = new Order(user, "AAPL", "EQUITY", "BUY", new BigDecimal("10"),
            new BigDecimal("150.00"), "PENDING", LocalDateTime.now(), "USD");

        when(orderRepo.findByIdForUpdate(42)).thenReturn(Optional.of(order));
        when(cashRepo.findByUserProfileAndCurrency(user, "USD")).thenReturn(Optional.of(cash));
        when(holdingRepo.findByUserProfileAndTicker(user, "AAPL")).thenReturn(Optional.empty());

        service.executeOrder(42);   // first delivery
        service.executeOrder(42);   // duplicate delivery

        verify(tradeRepo, times(1)).save(any(Trade.class));        // one trade
        assertEquals(new BigDecimal("8500.00"), cash.getBalance()); // charged once
        assertEquals("FILLED", order.getOrderStatus());
    }
}
