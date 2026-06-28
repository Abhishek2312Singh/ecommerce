package com.rks.productservice.controller;

import com.rks.productservice.dto.requestDto.ProductRequest;
import com.rks.productservice.dto.responseDto.ProductResponse;
import com.rks.productservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/product")
public class ProductController {
    @Autowired
    private ProductService productService;
    @GetMapping("/public/get-all")
    public ResponseEntity<List<ProductResponse>> getAllProduct(){
        return ResponseEntity.ok(productService.getAllProduct());
    }
    @GetMapping("/public/{prodId}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long prodId){
        return ResponseEntity.ok(productService.getProductById(prodId));
    }
    @PostMapping("/add-product")
    public ResponseEntity<String> addProduct(@RequestBody ProductRequest productRequest){
        return ResponseEntity.ok(productService.addProduct(productRequest));
    }
    @PutMapping("/update-product")
    public ResponseEntity<String> updateProduct(@RequestParam Long prodId,@RequestBody ProductRequest productRequest){
        return ResponseEntity.ok(productService.updateProduct(prodId,productRequest));
    }
    @DeleteMapping("/remove-product")
    public ResponseEntity<String> removeProduct(@RequestParam Long prodId){
        return ResponseEntity.ok(productService.deleteProduct(prodId));
    }
}
