package com.matador.app.repository;

import com.matador.app.entity.Order;
import com.matador.app.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserProfile(UserProfile userProfile);
    List<Order> findByUserProfileAndOrderStatus(UserProfile userProfile, String orderStatus);
    List<Order> findByUserProfileAndTicker(UserProfile userProfile, String ticker);
    List<Order> findByUserProfileAndSubmittedAtBetween(UserProfile userProfile, LocalDateTime start, LocalDateTime end);
}
