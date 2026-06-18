package com.ecom.rks.service;

import com.ecom.rks.entity.*;
import com.ecom.rks.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class OrderService {
    private final CustomerRepo customerRepo;
    private final CartRepo cartRepo;
    private final ProductRepo productRepo;
    private final OrderRepo orderRepo;
    private final OrderItemRepo orderItemRepo;
    private final CartItemRepo cartItemRepo;

    public OrderService(
            CustomerRepo customerRepo,
            CartRepo cartRepo,
            ProductRepo productRepo,
            OrderRepo orderRepo,
            OrderItemRepo orderItemRepo,
            CartItemRepo cartItemRepo
    ) {
        this.customerRepo = customerRepo;
        this.cartRepo = cartRepo;
        this.productRepo = productRepo;
        this.orderRepo = orderRepo;
        this.orderItemRepo = orderItemRepo;
        this.cartItemRepo = cartItemRepo;
    }
    @Transactional
    public Orders createOrder(Long customerId){
        Customer customer = customerRepo.findById(customerId).orElseThrow(()->new RuntimeException("Customer Not Found!"));
        Cart cart = cartRepo.findByCustomer(customer).orElseThrow(()->new RuntimeException("Cart Not Found!"));
        if(cart.getCartItemList().isEmpty()){
            throw new RuntimeException("Cart is empty!");
        }
        Orders orders = new Orders();
        orders.setOrderId(UUID.randomUUID().toString());
        orders.setCustomer(customer);
        orders.setDelivered(false);
        orders = orderRepo.save(orders);
        Double totalAmt = 0.0;

        List<OrderItem> orderItemList = new ArrayList<>();
        for(CartItem cartItem : cart.getCartItemList()){
            OrderItem orderItem = new OrderItem();
            Product product = cartItem.getProduct();
            if (product.getProdQuantity()<cartItem.getQuantity()){
                throw new RuntimeException("Product Out Of Stock!");
            }
            orderItem.setOrder(orders);
            orderItem.setProduct(product);
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setProdPrice(cartItem.getPriceAtAddition());
            Double itemTotal = orderItem.getProdPrice() * orderItem.getQuantity();
            totalAmt = totalAmt + itemTotal;

            product.setProdQuantity(product.getProdQuantity()- cartItem.getQuantity());

            productRepo.save(product);
            orderItemList.add(orderItem);
        }
        orderItemRepo.saveAll(orderItemList);
        orders.setOrderItems(orderItemList);
        orders.setOrderDate(LocalDateTime.now());
        orders = orderRepo.save(orders);
        cartItemRepo.deleteAll(cart.getCartItemList());
        cart.getCartItemList().clear();
        cartRepo.save(cart);
        return orders;
    }
    public Orders getOrderById(Long orderId){
        return orderRepo.findById(orderId).orElseThrow(()->new RuntimeException("Order Not Found!"));
    }
}
