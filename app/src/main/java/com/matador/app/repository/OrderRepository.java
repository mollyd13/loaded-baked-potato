package com.matador.app.repository;

import com.matador.app.entity.Order;
import com.matador.app.entity.UserProfile;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Integer> {
    List<Order> findByUserProfile(UserProfile userProfile);
    List<Order> findByUserProfileAndOrderStatus(UserProfile userProfile, String orderStatus);
    List<Order> findByUserProfileAndTicker(UserProfile userProfile, String ticker);
    List<Order> findByUserProfileAndSubmittedAtBetween(UserProfile userProfile, LocalDateTime start, LocalDateTime end);

    // Row lock so two deliveries of the same event cannot both execute the order
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from Order o where o.orderId = :orderId")
    Optional<Order> findByIdForUpdate(@Param("orderId") Integer orderId);
}
