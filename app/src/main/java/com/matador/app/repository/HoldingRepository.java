package com.matador.app.repository;

import com.matador.app.entity.Holding;
import com.matador.app.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HoldingRepository extends JpaRepository<Holding, Integer> {
    List<Holding> findByUserProfile(UserProfile userProfile);
    List<Holding> findByUserProfileAndAssetType(UserProfile userProfile, String assetType);
    Optional<Holding> findByUserProfileAndTicker(UserProfile userProfile, String ticker);
    List<Holding> findByUserProfileAndCurrency(UserProfile userProfile, String currency);
}
