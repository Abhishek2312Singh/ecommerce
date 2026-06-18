package com.ecom.rks.controller;

import com.ecom.rks.entity.Cart;
import com.ecom.rks.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping
public class CartController {
    @Autowired
    private CartService cartService;
    @PostMapping("/add")
    public ResponseEntity<Cart> addToCart(@RequestParam Long customerId, @RequestParam Long productId, @RequestParam Integer quantity){
        return ResponseEntity.ok(cartService.addToCart(customerId,productId,quantity));
    }
    @GetMapping
    public ResponseEntity<Cart> getCart(@RequestParam Long customerId){
        return ResponseEntity.ok(cartService.getCart(customerId));
    }
    @PutMapping("/item/{cartItemId}")
    public ResponseEntity<Cart> updateQuantity(@PathVariable Long cartItemId, @RequestParam Long customerId, @RequestParam Integer quantity) {
        return ResponseEntity.ok(cartService.updateCart(customerId, cartItemId, quantity));
    }
    @DeleteMapping("/item/{cartItemId}")
    public ResponseEntity<Cart> removeItem(@PathVariable Long cartItemId, @RequestParam Long customerId) {
        return ResponseEntity.ok(cartService.removeFromCart(customerId, cartItemId));
    }

    @DeleteMapping("/clear/{customerId}")
    public ResponseEntity<String> clearCart(@PathVariable Long customerId) {
        cartService.clearCart(customerId);
        return ResponseEntity.ok("Cart Cleared Successfully");
    }
}
