package com.tripnest.trip.service;

import com.tripnest.trip.dto.DocumentResponse;
import com.tripnest.trip.entity.DocumentCategory;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentService {
    DocumentResponse uploadDocument(Long tripId, DocumentCategory category, String customName, MultipartFile file);
    List<DocumentResponse> getDocuments(Long tripId, DocumentCategory category);
    DocumentResponse getDocumentById(Long id);
    void deleteDocument(Long id);
}
