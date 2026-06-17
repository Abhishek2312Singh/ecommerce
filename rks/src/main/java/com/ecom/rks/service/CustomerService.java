package com.ecom.rks.service;

import com.ecom.rks.dto.requestDto.CustomerRequest;
import com.ecom.rks.dto.responseDto.CustomerResponse;
import com.ecom.rks.entity.Customer;
import com.ecom.rks.repository.CustomerRepo;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CustomerService {
    @Autowired
    private ModelMapper modelMapper;
    @Autowired
    private CustomerRepo customerRepo;
    public String addCustomer(CustomerRequest customerRequest){
        Customer customer = modelMapper.map(customerRequest,Customer.class);
        customerRepo.save(customer);
        return "Customer Saved!";
    }
    public String updateCustomer(Long id, CustomerRequest customerRequest){
        Customer customer = customerRepo.findById(id).orElseThrow(()->new RuntimeException("Customer not found!"));
        customer = modelMapper.map(customerRequest,Customer.class);
        customer.setId(id);
        customerRepo.save(customer);
        return "Customer updated!";
    }
    public String deleteCustomer(Long id){
        Customer customer = customerRepo.findById(id).orElseThrow(()->new RuntimeException("Customer not found!"));
        customerRepo.delete(customer);
        return "Customer Deleted!";
    }
    public CustomerResponse getCustomerById(Long id){
        Customer customer = customerRepo.findById(id).orElseThrow(()->new RuntimeException("Customer not found!"));
        return modelMapper.map(customer,CustomerResponse.class);
    }
    public CustomerResponse getCustomerByEmail(String email){
        Customer customer = customerRepo.findByEmail(email).orElseThrow(()->new RuntimeException("Customer not found!"));
        return modelMapper.map(customer,CustomerResponse.class);
    }
}
