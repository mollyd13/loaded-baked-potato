package com.matador.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "\"order\"", schema = "app")
public class Order {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "order_id")
    private Integer orderId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile userProfile;
    
    @Column(name = "ticker", nullable = false)
    private String ticker;
    
    @Column(name = "asset_type", nullable = false)
    private String assetType;
    
    @Column(name = "action_type", nullable = false)
    private String actionType;
    
    @Column(name = "order_type", nullable = false)
    private String orderType;
    
    @Column(name = "qty", nullable = false)
    private Integer quantity;
    
    @Column(name = "price", nullable = false, precision = 38, scale = 2)
    private BigDecimal price;
    
    @Column(name = "timing", nullable = false)
    private String timing;
    
    @Column(name = "order_status", nullable = false)
    private String orderStatus;
    
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;
    
    @Column(name = "currency", nullable = false)
    private String currency;
    
    // Relationships
    @OneToMany(mappedBy = "order", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Trade> trades;
    
    // Constructors
    public Order() {
    }
    
    public Order(UserProfile userProfile, String ticker, String assetType, String actionType,
                 String orderType, Integer quantity, BigDecimal price, String timing,
                 String orderStatus, LocalDateTime submittedAt, String currency) {
        this.userProfile = userProfile;
        this.ticker = ticker;
        this.assetType = assetType;
        this.actionType = actionType;
        this.orderType = orderType;
        this.quantity = quantity;
        this.price = price;
        this.timing = timing;
        this.orderStatus = orderStatus;
        this.submittedAt = submittedAt;
        this.currency = currency;
    }
    
    // Getters and Setters
    public Integer getOrderId() {
        return orderId;
    }
    
    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
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
    
    public String getOrderType() {
        return orderType;
    }
    
    public void setOrderType(String orderType) {
        this.orderType = orderType;
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
    
    public String getTiming() {
        return timing;
    }
    
    public void setTiming(String timing) {
        this.timing = timing;
    }
    
    public String getOrderStatus() {
        return orderStatus;
    }
    
    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }
    
    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
    
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public List<Trade> getTrades() {
        return trades;
    }
    
    public void setTrades(List<Trade> trades) {
        this.trades = trades;
    }
}
