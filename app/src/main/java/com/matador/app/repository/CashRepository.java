package com.matador.app.repository;

import com.matador.app.entity.Cash;
import com.matador.app.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CashRepository extends JpaRepository<Cash, Integer> {
    List<Cash> findByUserProfile(UserProfile userProfile);
    Optional<Cash> findByUserProfileAndCurrency(UserProfile userProfile, String currency);
}
