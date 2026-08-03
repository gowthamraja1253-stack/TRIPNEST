package com.tripnest.trip.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateDestinationRequest {

    @NotBlank(message = "Destination name is required")
    private String name;

    @NotBlank(message = "Country is required")
    private String country;

    private String description;

    private String attractions;

    private Boolean popular;

    private String imageUrl;
}
