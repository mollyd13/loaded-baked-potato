package com.matador.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "holding", schema = "app")
public class Holding {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "holding_id")
    private Integer holdingId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile userProfile;
    
    @Column(name = "ticker", nullable = false)
    private String ticker;
    
    @Column(name = "asset_type", nullable = false)
    private String assetType;
    
    @Column(name = "qty", nullable = false)
    private Integer quantity;
    
    @Column(name = "currency", nullable = false)
    private String currency;
    
    @Column(name = "avg_price", nullable = false, precision = 38, scale = 2)
    private BigDecimal averagePrice;
    
    // Constructors
    public Holding() {
    }
    
    public Holding(UserProfile userProfile, String ticker, String assetType, 
                   Integer quantity, String currency, BigDecimal averagePrice) {
        this.userProfile = userProfile;
        this.ticker = ticker;
        this.assetType = assetType;
        this.quantity = quantity;
        this.currency = currency;
        this.averagePrice = averagePrice;
    }
    
    // Getters and Setters
    public Integer getHoldingId() {
        return holdingId;
    }
    
    public void setHoldingId(Integer holdingId) {
        this.holdingId = holdingId;
    }
    
    public UserProfile getUserProfile() {
        return userProfile;
    }
    
    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
    }
    
    public String getTicker() {
        return ticker;
    }
    
    public void setTicker(String ticker) {
        this.ticker = ticker;
    }
    
    public String getAssetType() {
        return assetType;
    }
    
    public void setAssetType(String assetType) {
        this.assetType = assetType;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public BigDecimal getAveragePrice() {
        return averagePrice;
    }
    
    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }
}
