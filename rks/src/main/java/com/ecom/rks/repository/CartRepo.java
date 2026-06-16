package com.ecom.rks.repository;

import com.ecom.rks.entity.Cart;
import com.ecom.rks.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepo extends JpaRepository<Cart,Long> {
    Optional<Cart> findByCustomer(Customer customer);
}
