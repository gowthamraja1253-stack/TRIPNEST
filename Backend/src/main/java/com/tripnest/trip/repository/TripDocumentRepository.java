package com.tripnest.trip.repository;

import com.tripnest.trip.entity.DocumentCategory;
import com.tripnest.trip.entity.TripDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripDocumentRepository extends JpaRepository<TripDocument, Long> {
    List<TripDocument> findByTripId(Long tripId);
    List<TripDocument> findByTripIdAndCategory(Long tripId, DocumentCategory category);
    List<TripDocument> findByCategory(DocumentCategory category);
}
