package com.matador.app.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_profile", schema = "app")
public class UserProfile {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Integer userId;
    
    @Column(name = "fname", nullable = false)
    private String firstName;
    
    @Column(name = "lname", nullable = false)
    private String lastName;
    
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    
    @Column(name = "pwd_hash", nullable = false, unique = true)
    private String passwordHash;
    
    @Column(name = "phone", nullable = false, unique = true)
    private Integer phone;
    
    @Column(name = "role_type", nullable = false)
    private String roleType;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;
    
    // Relationships
    @OneToMany(mappedBy = "userProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Holding> holdings;
    
    @OneToMany(mappedBy = "userProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Cash> cashAccounts;
    
    @OneToMany(mappedBy = "userProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Order> orders;
    
    @OneToMany(mappedBy = "userProfile", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<Trade> trades;
    
    // Constructors
    public UserProfile() {
    }
    
    public UserProfile(String firstName, String lastName, String email, String passwordHash, 
                      Integer phone, String roleType, LocalDateTime createdAt) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.roleType = roleType;
        this.createdAt = createdAt;
    }
    
    public UserProfile(String firstName, String lastName, String email, String passwordHash, 
                      Integer phone, String roleType, LocalDateTime createdAt, LocalDateTime deletedAt) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.phone = phone;
        this.roleType = roleType;
        this.createdAt = createdAt;
        this.deletedAt = deletedAt;
    }
    
    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getFirstName() {
        return firstName;
    }
    
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }
    
    public String getLastName() {
        return lastName;
    }
    
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }
    
    public String getEmail() {
        return email;
    }
    
    public void setEmail(String email) {
        this.email = email;
    }
    
    public String getPasswordHash() {
        return passwordHash;
    }
    
    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }
    
    public Integer getPhone() {
        return phone;
    }
    
    public void setPhone(Integer phone) {
        this.phone = phone;
    }
    
    public String getRoleType() {
        return roleType;
    }
    
    public void setRoleType(String roleType) {
        this.roleType = roleType;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }
    
    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }
    
    public List<Holding> getHoldings() {
        return holdings;
    }
    
    public void setHoldings(List<Holding> holdings) {
        this.holdings = holdings;
    }
    
    public List<Cash> getCashAccounts() {
        return cashAccounts;
    }
    
    public void setCashAccounts(List<Cash> cashAccounts) {
        this.cashAccounts = cashAccounts;
    }
    
    public List<Order> getOrders() {
        return orders;
    }
    
    public void setOrders(List<Order> orders) {
        this.orders = orders;
    }
    
    public List<Trade> getTrades() {
        return trades;
    }
    
    public void setTrades(List<Trade> trades) {
        this.trades = trades;
    }
}
