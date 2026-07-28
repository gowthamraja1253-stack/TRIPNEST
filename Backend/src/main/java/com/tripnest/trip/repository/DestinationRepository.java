package com.tripnest.trip.repository;

import com.tripnest.trip.entity.Destination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DestinationRepository extends JpaRepository<Destination, Long> {

    List<Destination> findByPopularTrue();

    List<Destination> findByNameContainingIgnoreCaseOrCountryContainingIgnoreCase(String name, String country);

    Optional<Destination> findByNameIgnoreCase(String name);
}
