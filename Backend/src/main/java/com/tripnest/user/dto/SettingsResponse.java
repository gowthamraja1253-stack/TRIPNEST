package com.tripnest.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SettingsResponse {
    private String currency;
    private String language;
    private String timezone;
    private Boolean emailNotifications;
    private Boolean pushNotifications;
    private String theme;
}
