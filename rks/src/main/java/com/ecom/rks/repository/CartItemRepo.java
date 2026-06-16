package com.ecom.rks.repository;

import com.ecom.rks.entity.Cart;
import com.ecom.rks.entity.CartItem;
import com.ecom.rks.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepo extends JpaRepository<CartItem,Long> {
    Optional<CartItem> findByCartAndProduct(Cart cart, Product product);
}
