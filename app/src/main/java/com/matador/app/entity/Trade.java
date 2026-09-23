package com.matador.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade", schema = "app")
public class Trade {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Integer tradeId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile userProfile;
    
    @Column(name = "ticker", nullable = false)
    private String ticker;
    
    @Column(name = "asset_type", nullable = false)
    private String assetType;
    
    @Column(name = "action_type", nullable = false)
    private String actionType;
    
    @Column(name = "qty", nullable = false)
    private Integer quantity;
    
    @Column(name = "price", nullable = false, precision = 38, scale = 2)
    private BigDecimal price;
    
    @Column(name = "currency", nullable = false)
    private String currency;
    
    @Column(name = "fee", nullable = false, precision = 38, scale = 2)
    private BigDecimal fee;
    
    @Column(name = "executed_at", nullable = false)
    private LocalDateTime executedAt;
    
    // Constructors
    public Trade() {
    }
    
    public Trade(Order order, UserProfile userProfile, String ticker, String assetType,
                 String actionType, Integer quantity, BigDecimal price, String currency,
                 BigDecimal fee, LocalDateTime executedAt) {
        this.order = order;
        this.userProfile = userProfile;
        this.ticker = ticker;
        this.assetType = assetType;
        this.actionType = actionType;
        this.quantity = quantity;
        this.price = price;
        this.currency = currency;
        this.fee = fee;
        this.executedAt = executedAt;
    }
    
    // Getters and Setters
    public Integer getTradeId() {
        return tradeId;
    }
    
    public void setTradeId(Integer tradeId) {
        this.tradeId = tradeId;
    }
    
    public Order getOrder() {
        return order;
    }
    
    public void setOrder(Order order) {
        this.order = order;
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
    
    public String getActionType() {
        return actionType;
    }
    
    public void setActionType(String actionType) {
        this.actionType = actionType;
    }
    
    public Integer getQuantity() {
        return quantity;
    }
    
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
    public BigDecimal getPrice() {
        return price;
    }
    
    public void setPrice(BigDecimal price) {
        this.price = price;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public BigDecimal getFee() {
        return fee;
    }
    
    public void setFee(BigDecimal fee) {
        this.fee = fee;
    }
    
    public LocalDateTime getExecutedAt() {
        return executedAt;
    }
    
    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }
}
