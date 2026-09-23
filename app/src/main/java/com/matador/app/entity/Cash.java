package com.matador.app.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "cash", schema = "app")
public class Cash {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cash_account_id")
    private Integer cashAccountId;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private UserProfile userProfile;
    
    @Column(name = "currency", nullable = false)
    private String currency;
    
    @Column(name = "balance", nullable = false, precision = 38, scale = 2)
    private BigDecimal balance;
    
    // Constructors
    public Cash() {
    }
    
    public Cash(UserProfile userProfile, String currency, BigDecimal balance) {
        this.userProfile = userProfile;
        this.currency = currency;
        this.balance = balance;
    }
    
    // Getters and Setters
    public Integer getCashAccountId() {
        return cashAccountId;
    }
    
    public void setCashAccountId(Integer cashAccountId) {
        this.cashAccountId = cashAccountId;
    }
    
    public UserProfile getUserProfile() {
        return userProfile;
    }
    
    public void setUserProfile(UserProfile userProfile) {
        this.userProfile = userProfile;
    }
    
    public String getCurrency() {
        return currency;
    }
    
    public void setCurrency(String currency) {
        this.currency = currency;
    }
    
    public BigDecimal getBalance() {
        return balance;
    }
    
    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }
}
