package com.example.petcare.controller;

import com.example.petcare.entity.Product;
import com.example.petcare.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/admin/products")
@PreAuthorize("hasRole('ADMIN')")
public class AdminProductController {

    private final ProductService service;

    public AdminProductController(ProductService service) {
        this.service = service;
    }

    @GetMapping
    public List<Product> all() {
        return service.getAll();
    }

    @PostMapping
    public Product create(@RequestBody Product p) {
        return service.create(p);
    }

    @PutMapping("/{id}")
    public Product update(@PathVariable Long id, @RequestBody Product p) {
        return service.update(id, p);
    }

    @PutMapping("/{id}/status")
    public void toggle(@PathVariable Long id, @RequestBody ToggleRequest r) {
        service.toggleStatus(id, r.active);
    }

    @PostMapping("/{id}/image")
    public ResponseEntity<?> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        service.uploadImage(id, file);
        return ResponseEntity.ok().build();
    }

    static class ToggleRequest {
        public boolean active;
    }
}
