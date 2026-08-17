package com.example.petcare.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebConfig implements WebMvcConfigurer {

  // ---------- CORS (LOCAL + PRODUCTION) ----------
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/**")
      .allowedOriginPatterns("http://localhost:*", "https://*.vercel.app", "https://*.netlify.app", "*")
      .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
      .allowedHeaders("*")
      .allowCredentials(true);
  }

  // ---------- STATIC FILE SERVING (NEW) ----------
  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {

    Path uploadDir = Paths.get("uploads");
    String uploadPath = uploadDir.toFile().getAbsolutePath();

    registry.addResourceHandler("/uploads/**")
        .addResourceLocations("file:" + uploadPath + "/");
    
    registry.addResourceHandler("/products/**")
    .addResourceLocations("file:" + uploadPath + "/products/");
  }
}
