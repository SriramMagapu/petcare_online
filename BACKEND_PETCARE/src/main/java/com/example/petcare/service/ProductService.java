package com.example.petcare.service;

import com.example.petcare.entity.Product;
import com.example.petcare.repository.ProductRepository;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;
    private final CloudinaryService cloudinaryService;

    public ProductService(ProductRepository repo, CloudinaryService cloudinaryService) {
        this.repo = repo;
        this.cloudinaryService = cloudinaryService;
    }

    /* ---------- ADMIN ---------- */

    public List<Product> getAll() {
        return repo.findAll();
    }

    public Product create(Product p) {
        return repo.save(p);
    }

    public Product update(Long id, Product updated) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        p.setName(updated.getName());
        p.setCategory(updated.getCategory());
        p.setPrice(updated.getPrice());
        p.setQuantity(updated.getQuantity());
        p.setActive(updated.isActive());

        return repo.save(p);
    }

    public void toggleStatus(Long id, boolean active) {
        Product p = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        p.setActive(active);
        repo.save(p);
    }

    /* ---------- IMAGE ---------- */

    public void uploadImage(Long productId, MultipartFile file) throws IOException {

        Product p = repo.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        String uploadedUrl = cloudinaryService.uploadFile(file, "products/prod_" + productId);
        if (uploadedUrl != null) {
            p.setImagePath(uploadedUrl);
            repo.save(p);
        }
    }

    public Resource loadImage(Long productId) {
        Product p = repo.findById(productId).orElse(null);
        if (p == null || p.getImagePath() == null) return null;

        File file = new File("uploads/" + p.getImagePath());
        if (!file.exists()) return null;

        return new FileSystemResource(file);
    }

    /* ---------- OWNER ---------- */

    public List<Product> getActiveProducts() {
        return repo.findByActiveTrue();
    }
}

