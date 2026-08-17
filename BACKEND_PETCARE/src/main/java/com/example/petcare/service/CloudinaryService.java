package com.example.petcare.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public boolean isConfigured() {
        return cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
    }

    /**
     * Uploads a file (image or document) to Cloudinary or falls back to local disk.
     *
     * @param file   MultipartFile from client
     * @param folder Subfolder name (e.g. "pets", "owners", "vets", "products", "certificates")
     * @return Full HTTPS URL from Cloudinary or local path.
     */
    public String uploadFile(MultipartFile file, String folder) throws IOException {
        if (file == null || file.isEmpty()) {
            return null;
        }

        if (isConfigured()) {
            try {
                @SuppressWarnings("rawtypes")
                Map uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        ObjectUtils.asMap(
                                "folder", "petcare/" + folder,
                                "resource_type", "auto"
                        )
                );
                return (String) uploadResult.get("secure_url");
            } catch (Exception e) {
                System.err.println("Cloudinary upload failed: " + e.getMessage() + ". Falling back to local storage.");
                return saveLocally(file, folder);
            }
        } else {
            return saveLocally(file, folder);
        }
    }

    private String saveLocally(MultipartFile file, String folder) throws IOException {
        String cleanFolder = folder.replaceAll("[^a-zA-Z0-9/_-]", "_");
        Path dir = Paths.get("uploads", cleanFolder);
        Files.createDirectories(dir);

        String orig = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file.jpg";
        String ext = orig.contains(".") ? orig.substring(orig.lastIndexOf(".")) : ".jpg";
        String fileName = UUID.randomUUID().toString() + ext;

        Path target = dir.resolve(fileName);
        Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + cleanFolder + "/" + fileName;
    }
}
