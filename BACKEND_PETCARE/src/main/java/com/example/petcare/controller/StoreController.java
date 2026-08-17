package com.example.petcare.controller;

import com.example.petcare.entity.Product;
import com.example.petcare.repository.ProductRepository;
import com.example.petcare.service.ProductService;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store")
public class StoreController {

    private final ProductService service;

    public StoreController(ProductService service) {
        this.service = service;
    }

    @GetMapping("/products")
    public List<Product> products() {
        return service.getActiveProducts();
    }
}
