package com.matador.app.service;

import com.matador.app.entity.Holding;
import com.matador.app.entity.UserProfile;
import com.matador.app.repository.HoldingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;


@Service
public class HoldingService {

    private final HoldingRepository holdingRepository;

    public HoldingService(HoldingRepository holdingRepository) {
        this.holdingRepository = holdingRepository;
    }

    public List<Holding> getUserHoldings(UserProfile userProfile) {
        return holdingRepository.findByUserProfile(userProfile);
    }

    public List<Holding> getHoldingsByAssetType(UserProfile userProfile, String assetType) {
        return holdingRepository.findByUserProfileAndAssetType(userProfile, assetType);
    }

    public Optional<Holding> getHoldingByTicker(UserProfile userProfile, String ticker) {
        return holdingRepository.findByUserProfileAndTicker(userProfile, ticker);
    }

    public List<Holding> getHoldingsByCurrency(UserProfile userProfile, String currency) {
        return holdingRepository.findByUserProfileAndCurrency(userProfile, currency);
    }

    @Transactional
    public Holding createHolding(UserProfile userProfile, String ticker, String assetType,
                                 BigDecimal quantity, String currency, BigDecimal price) {
        Holding holding = new Holding(userProfile, ticker, assetType, quantity, currency, price);
        return holdingRepository.save(holding);
    }

    @Transactional
    public Holding updateHoldingOnBuy(Holding holding, BigDecimal quantity, BigDecimal price) {
        BigDecimal oldQuantity = holding.getQuantity();
        BigDecimal oldAvgPrice = holding.getAveragePrice();
        
        BigDecimal oldCost = oldAvgPrice.multiply(oldQuantity);
        BigDecimal newCost = price.multiply(quantity);
        BigDecimal totalCost = oldCost.add(newCost);
        BigDecimal totalQuantity = oldQuantity.add(quantity);
        BigDecimal newAvgPrice = totalCost.divide(totalQuantity, BigDecimal.ROUND_HALF_UP);
        
        holding.setQuantity(totalQuantity);
        holding.setAveragePrice(newAvgPrice);
        
        return holdingRepository.save(holding);
    }

    @Transactional
    public Holding updateHoldingOnSell(Holding holding, BigDecimal quantity) {
        BigDecimal remainingQuantity = holding.getQuantity().subtract(quantity);
        
        if (remainingQuantity.compareTo(BigDecimal.ZERO) <= 0) {
            holdingRepository.delete(holding);
            return null;
        }
        
        holding.setQuantity(remainingQuantity);
        return holdingRepository.save(holding);
    }

    @Transactional
    public Holding saveHolding(Holding holding) {
        return holdingRepository.save(holding);
    }

    @Transactional
    public void deleteHolding(Holding holding) {
        holdingRepository.delete(holding);
    }

    public boolean hasSufficientHoldings(UserProfile userProfile, String ticker, BigDecimal quantity) {
        Optional<Holding> holding = holdingRepository.findByUserProfileAndTicker(userProfile, ticker);
        return holding.isPresent() && holding.get().getQuantity().compareTo(quantity) >= 0;
    }
}
