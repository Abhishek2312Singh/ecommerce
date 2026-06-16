package com.ecom.rks.service;

import com.ecom.rks.entity.Cart;
import com.ecom.rks.entity.CartItem;
import com.ecom.rks.entity.Customer;
import com.ecom.rks.entity.Product;
import com.ecom.rks.repository.CartItemRepo;
import com.ecom.rks.repository.CartRepo;
import com.ecom.rks.repository.CustomerRepo;
import com.ecom.rks.repository.ProductRepo;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class CartService {

    private final CartRepo cartRepo;
    private final CustomerRepo customerRepo;
    private final ProductRepo productRepo;
    private final CartItemRepo cartItemRepo;

    public CartService(CartRepo cartRepo,
                       CustomerRepo customerRepo,
                       ProductRepo productRepo,
                       CartItemRepo cartItemRepo) {
        this.cartRepo = cartRepo;
        this.customerRepo = customerRepo;
        this.productRepo = productRepo;
        this.cartItemRepo = cartItemRepo;
    }
    @Transactional
    public Cart addToCart(Long customerId, Long productId, Integer quantity){
        Customer customer = customerRepo.findById(customerId).orElseThrow(()-> new RuntimeException("Customer Not Found"));
        Product product = productRepo.findById(productId).orElseThrow(()-> new RuntimeException("Product Not Found"));

        if(product.getProdQuantity()< quantity){
            throw new RuntimeException("Product out of stock!");
        }
        Cart cart = cartRepo.findByCustomer(customer).orElseGet(()->{
           Cart newCart = new Cart();
           newCart.setCustomer(customer);
           return cartRepo.save(newCart);
        });
        Optional<CartItem> existingCartItem = cartItemRepo.findByCartAndProduct(cart,product);
        if(existingCartItem.isPresent()){
            CartItem item = existingCartItem.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepo.save(item);
        }else{
            CartItem item = new CartItem();
            item.setProduct(product);
            item.setCart(cart);
            item.setQuantity(quantity);
            item.setPriceAtAddition(product.getProdPrice());
            cartItemRepo.save(item);
        }
        return cartRepo.findByCustomer(customer).orElseThrow();
    }
    public Cart getCart(Long customerId){
        Customer customer = customerRepo.findById(customerId).orElseThrow(()->new RuntimeException("Customer not found!"));
        return cartRepo.findByCustomer(customer).orElseThrow(()->new RuntimeException("Cart not found!"));
    }
    @Transactional
    public Cart updateCart(Long customerId, Long cartItemId, Integer quantity){
        Customer customer = customerRepo.findById(customerId).orElseThrow(()->new RuntimeException("Customer not found!"));
        CartItem cartItem = cartItemRepo.findById(cartItemId).orElseThrow(()->new RuntimeException("Cart Item not found!"));
        Product product = cartItem.getProduct();
        if(quantity> product.getProdQuantity()){
            throw new RuntimeException("Stock unavailable");
        }
        cartItem.setQuantity(quantity);
        cartItemRepo.save(cartItem);
        return cartItem.getCart();
    }
    @Transactional
    public Cart removeFromCart(Long customerId, Long cartItemId){
        CartItem cartItem = cartItemRepo.findById(cartItemId).orElseThrow(()-> new RuntimeException("Cart item not found"));
        Cart cart = cartItem.getCart();
        cart.getCartItemList().remove(cartItem);
        cartRepo.save(cart);
        return cart;
    }
    @Transactional
    public Cart clearCart(Long customerId){
        Customer customer = customerRepo.findById(customerId).orElseThrow(()-> new RuntimeException("Customer Not Found"));
        Cart cart = cartRepo.findByCustomer(customer).orElseThrow(()->new RuntimeException("Cart Not found!"));
         cart.getCartItemList().clear();
         return cart;
    }
}
