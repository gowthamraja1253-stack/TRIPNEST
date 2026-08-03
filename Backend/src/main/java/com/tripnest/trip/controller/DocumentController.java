package com.tripnest.trip.controller;

import com.tripnest.common.dto.ApiResponse;
import com.tripnest.trip.dto.DocumentResponse;
import com.tripnest.trip.entity.DocumentCategory;
import com.tripnest.trip.service.DocumentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/v1/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @RequestParam("tripId") Long tripId,
            @RequestParam(value = "category", required = false) DocumentCategory category,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam("file") MultipartFile file) {
        DocumentResponse response = documentService.uploadDocument(tripId, category, name, file);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Document uploaded successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocuments(
            @RequestParam(value = "tripId", required = false) Long tripId,
            @RequestParam(value = "category", required = false) DocumentCategory category) {
        List<DocumentResponse> documents = documentService.getDocuments(tripId, category);
        return ResponseEntity.ok(ApiResponse.success(documents, "Documents retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentById(@PathVariable("id") Long id) {
        DocumentResponse document = documentService.getDocumentById(id);
        return ResponseEntity.ok(ApiResponse.success(document, "Document details retrieved successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDocument(@PathVariable("id") Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Document deleted successfully"));
    }
}
