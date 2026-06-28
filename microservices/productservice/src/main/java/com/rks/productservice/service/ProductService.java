package com.rks.productservice.service;

import com.rks.productservice.dto.requestDto.ProductRequest;
import com.rks.productservice.dto.responseDto.ProductResponse;
import com.rks.productservice.entity.Product;
import com.rks.productservice.repository.ProductRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ProductService {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private ProductRepo productRepo;
    public String addProduct(ProductRequest productRequest){
        Product product = new Product();
        product.setProdName(productRequest.getProdName());
        product.setProdQuantity(productRequest.getProdQuantity());
        product.setProdDesc(productRequest.getProdDesc());
        product.setProdPrice(productRequest.getProdPrice());
        productRepo.save(product);
        return "Product Saved!";
    }
    public String updateProduct(Long id, ProductRequest productRequest){
        Product product = productRepo.findById(id).orElseThrow(()->new RuntimeException("Product not found!"));
        product.setProdName(productRequest.getProdName());
        product.setProdQuantity(productRequest.getProdQuantity());
        product.setProdDesc(productRequest.getProdDesc());
        product.setProdPrice(productRequest.getProdPrice());
        productRepo.save(product);
        return "Product Saved!";
    }
    public String deleteProduct(Long id){
        Product product = productRepo.findById(id).orElseThrow(()->new RuntimeException("Product not found!"));
        productRepo.delete(product);
        return "Product Deleted!";
    }
    public List<ProductResponse> getAllProduct(){
        List<Product> products = productRepo.findAll();
        List<ProductResponse> productResponses = new ArrayList<>();
        for(Product product : products){
            ProductResponse productResponse = modelMapper.map(product, ProductResponse.class);
            productResponses.add(productResponse);
        }
        return productResponses;
    }
    public ProductResponse getProductById(Long id){
        Product product = productRepo.findById(id).orElseThrow(()->new RuntimeException("Product not found!"));
        return modelMapper.map(product, ProductResponse.class);
    }
}
