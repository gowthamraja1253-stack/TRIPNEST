package com.tripnest.user.controller;

import com.tripnest.common.dto.ApiResponse;
import com.tripnest.user.dto.SettingsResponse;
import com.tripnest.user.dto.UpdateProfileRequest;
import com.tripnest.user.dto.UpdateSettingsRequest;
import com.tripnest.user.dto.UserProfileResponse;
import com.tripnest.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileResponse profile = userService.getUserProfile(username);
        return ResponseEntity.ok(ApiResponse.success(profile, "Profile retrieved successfully"));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> updateUserProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName();
        UserProfileResponse updatedProfile = userService.updateUserProfile(username, request);
        return ResponseEntity.ok(ApiResponse.success(updatedProfile, "Profile updated successfully"));
    }

    @GetMapping("/profile/history")
    public ResponseEntity<ApiResponse<java.util.List<Object>>> getTravelHistory(Authentication authentication) {
        // Return placeholder empty list for travel history (Milestone 3 will link this to Trip entities)
        return ResponseEntity.ok(ApiResponse.success(java.util.Collections.emptyList(), "Travel history retrieved successfully"));
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<SettingsResponse>> getSettings(Authentication authentication) {
        String username = authentication.getName();
        SettingsResponse settings = userService.getSettings(username);
        return ResponseEntity.ok(ApiResponse.success(settings, "Settings retrieved successfully"));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<SettingsResponse>> updateSettings(
            Authentication authentication,
            @Valid @RequestBody UpdateSettingsRequest request) {
        String username = authentication.getName();
        SettingsResponse updatedSettings = userService.updateSettings(username, request);
        return ResponseEntity.ok(ApiResponse.success(updatedSettings, "Settings updated successfully"));
    }
}
