package com.tripnest.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.tripnest.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryStorageServiceImpl implements StorageService {

    private final Cloudinary cloudinary;

    public CloudinaryStorageServiceImpl(@Value("${cloudinary.url}") String cloudinaryUrl) {
        this.cloudinary = new Cloudinary(cloudinaryUrl);
    }

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        try {
            String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "file";
            String publicId = (StringUtils.hasText(subFolder) ? subFolder + "/" : "tripnest/") 
                    + UUID.randomUUID().toString() + "_" + originalFilename;

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "public_id", publicId,
                    "resource_type", "auto"
            ));

            return uploadResult.get("secure_url").toString();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file to Cloudinary", ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl) || !fileUrl.contains("cloudinary.com")) {
            return; // Not a cloudinary URL or empty
        }

        try {
            // Extract public_id from the URL
            // Cloudinary URL format: https://res.cloudinary.com/<cloud_name>/<resource_type>/<type>/v<version>/<public_id>.<extension>
            String[] parts = fileUrl.split("/");
            String lastPart = parts[parts.length - 1];
            String publicIdWithFolder = "";
            
            // Reconstruct the public_id including folders if present
            boolean startCopying = false;
            StringBuilder sb = new StringBuilder();
            for (String part : parts) {
                if (startCopying) {
                    if (sb.length() > 0) sb.append("/");
                    sb.append(part);
                }
                // public_id path usually starts after 'upload/v1234567/' or just 'upload/'
                if (part.equals("upload")) {
                    startCopying = true;
                } else if (startCopying && part.startsWith("v") && part.length() > 1 && Character.isDigit(part.charAt(1))) {
                    // skip version folder
                    sb = new StringBuilder(); 
                }
            }

            String fullPublicId = sb.toString();
            // Remove file extension
            int dotIndex = fullPublicId.lastIndexOf('.');
            if (dotIndex > 0) {
                fullPublicId = fullPublicId.substring(0, dotIndex);
            }

            if (StringUtils.hasText(fullPublicId)) {
                cloudinary.uploader().destroy(fullPublicId, ObjectUtils.emptyMap());
            }
        } catch (Exception e) {
            System.err.println("Could not delete stored file from Cloudinary: " + fileUrl);
        }
    }
}
