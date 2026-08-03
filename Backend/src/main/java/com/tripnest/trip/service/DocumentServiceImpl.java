package com.tripnest.trip.service;

import com.tripnest.common.service.StorageService;
import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.trip.dto.DocumentResponse;
import com.tripnest.trip.entity.DocumentCategory;
import com.tripnest.trip.entity.Trip;
import com.tripnest.trip.entity.TripDocument;
import com.tripnest.trip.repository.TripDocumentRepository;
import com.tripnest.trip.repository.TripRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentServiceImpl implements DocumentService {

    private final TripDocumentRepository tripDocumentRepository;
    private final TripRepository tripRepository;
    private final StorageService storageService;

    public DocumentServiceImpl(TripDocumentRepository tripDocumentRepository,
                               TripRepository tripRepository,
                               StorageService storageService) {
        this.tripDocumentRepository = tripDocumentRepository;
        this.tripRepository = tripRepository;
        this.storageService = storageService;
    }

    @Override
    @Transactional
    public DocumentResponse uploadDocument(Long tripId, DocumentCategory category, String customName, MultipartFile file) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found with ID: " + tripId));

        DocumentCategory cat = (category != null) ? category : DocumentCategory.TRAVEL_DOCUMENT;
        String subFolder = cat.name().toLowerCase();
        String fileUrl = storageService.storeFile(file, subFolder);

        String name = StringUtils.hasText(customName) ? customName : file.getOriginalFilename();

        TripDocument document = TripDocument.builder()
                .name(name)
                .fileUrl(fileUrl)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .category(cat)
                .trip(trip)
                .build();

        TripDocument saved = tripDocumentRepository.save(document);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentResponse> getDocuments(Long tripId, DocumentCategory category) {
        List<TripDocument> documents;

        if (tripId != null && category != null) {
            documents = tripDocumentRepository.findByTripIdAndCategory(tripId, category);
        } else if (tripId != null) {
            documents = tripDocumentRepository.findByTripId(tripId);
        } else if (category != null) {
            documents = tripDocumentRepository.findByCategory(category);
        } else {
            documents = tripDocumentRepository.findAll();
        }

        return documents.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(Long id) {
        TripDocument document = tripDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));
        return mapToResponse(document);
    }

    @Override
    @Transactional
    public void deleteDocument(Long id) {
        TripDocument document = tripDocumentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found with ID: " + id));

        storageService.deleteFile(document.getFileUrl());
        tripDocumentRepository.delete(document);
    }

    private DocumentResponse mapToResponse(TripDocument doc) {
        return DocumentResponse.builder()
                .id(doc.getId())
                .name(doc.getName())
                .fileUrl(doc.getFileUrl())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .category(doc.getCategory())
                .uploadedAt(doc.getUploadedAt())
                .tripId(doc.getTrip() != null ? doc.getTrip().getId() : null)
                .tripName(doc.getTrip() != null ? doc.getTrip().getTitle() : null)
                .build();
    }
}
