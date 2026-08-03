package com.tripnest.common.service;

import com.tripnest.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalStorageServiceImpl implements StorageService {

    private static final String UPLOAD_DIR = "./uploads";

    @Override
    public String storeFile(MultipartFile file, String subFolder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file.");
        }

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "file");
        String fileExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            fileExtension = originalFilename.substring(dotIndex);
        }

        String uniqueFilename = UUID.randomUUID().toString() + fileExtension;
        String folderPathStr = UPLOAD_DIR + (StringUtils.hasText(subFolder) ? "/" + subFolder.toLowerCase() : "");
        Path targetFolder = Paths.get(folderPathStr).toAbsolutePath().normalize();

        try {
            Files.createDirectories(targetFolder);
            Path targetPath = targetFolder.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return "/uploads/" + (StringUtils.hasText(subFolder) ? subFolder.toLowerCase() + "/" : "") + uniqueFilename;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file " + originalFilename, ex);
        }
    }

    @Override
    public void deleteFile(String fileUrl) {
        if (!StringUtils.hasText(fileUrl) || !fileUrl.startsWith("/uploads/")) {
            return;
        }

        try {
            String relativePath = fileUrl.substring("/uploads/".length());
            Path filePath = Paths.get(UPLOAD_DIR).resolve(relativePath).toAbsolutePath().normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            System.err.println("Could not delete stored file: " + fileUrl);
        }
    }
}
