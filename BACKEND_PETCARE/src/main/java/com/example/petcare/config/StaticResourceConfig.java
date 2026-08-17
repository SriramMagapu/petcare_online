package com.example.petcare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {

        // 👇 ABSOLUTE path to your workspace uploads folder
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(
                    "file:/D:/eclipse-workspace/petcare_auth/uploads/"
                );
    }
}
