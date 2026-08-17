package com.example.petcare.controller;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.web.bind.annotation.*;

import java.io.File;

@RestController
@RequestMapping("/uploads/products")
public class ProductImageController {

    @GetMapping("/{productId}/{imageName}")
    public Resource getProductImage(
            @PathVariable String productId,
            @PathVariable String imageName
    ) {

        File file = new File(
                System.getProperty("user.dir") +
                File.separator + "uploads" +
                File.separator + "products" +
                File.separator + productId +
                File.separator + imageName
        );

        if (!file.exists()) {
            return null;
        }

        return new FileSystemResource(file);
    }
}
