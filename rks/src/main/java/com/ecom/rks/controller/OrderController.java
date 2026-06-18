package com.ecom.rks.controller;

import com.ecom.rks.entity.Orders;
import com.ecom.rks.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    @Autowired
    private OrderService orderService;

    @PostMapping("/place/{customerId}")
    public ResponseEntity<Orders> placeOrder(@PathVariable Long customerId) {
        Orders orders = orderService.createOrder(customerId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<Orders> getOrder(@PathVariable Long orderId) {
        Orders orders = orderService.getOrderById(orderId);
        return ResponseEntity.ok(orders);
    }
}