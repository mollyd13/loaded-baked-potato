package com.matador.app.repository;

import com.matador.app.entity.Trade;
import com.matador.app.entity.UserProfile;
import com.matador.app.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TradeRepository extends JpaRepository<Trade, Integer> {
    List<Trade> findByUserProfile(UserProfile userProfile);
    List<Trade> findByOrder(Order order);
    List<Trade> findByUserProfileAndTicker(UserProfile userProfile, String ticker);
    List<Trade> findByUserProfileAndExecutedAtBetween(UserProfile userProfile, LocalDateTime start, LocalDateTime end);
}
