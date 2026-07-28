package com.tripnest.user.dto;

import lombok.Data;
import jakarta.validation.constraints.Size;

@Data
public class UpdateSettingsRequest {

    @Size(max = 10, message = "Currency must not exceed 10 characters")
    private String currency;

    @Size(max = 10, message = "Language must not exceed 10 characters")
    private String language;

    @Size(max = 50, message = "Timezone must not exceed 50 characters")
    private String timezone;

    private Boolean emailNotifications;
    private Boolean pushNotifications;

    @Size(max = 20, message = "Theme must not exceed 20 characters")
    private String theme;
}
