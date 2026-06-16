package com.ecom.rks.entity;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Customer extends User{
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String customerId;
    @OneToMany
    @JoinColumn(name = "customer")
    private List<Order> orders;

    private List<Review> reviews;
}
