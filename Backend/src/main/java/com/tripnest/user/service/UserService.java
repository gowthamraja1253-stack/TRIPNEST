package com.tripnest.user.service;

import com.tripnest.user.dto.UpdateProfileRequest;
import com.tripnest.user.dto.UserProfileResponse;
import com.tripnest.user.dto.UpdatePasswordRequest;

import com.tripnest.user.dto.SettingsResponse;
import com.tripnest.user.dto.UpdateSettingsRequest;

public interface UserService {
    UserProfileResponse getUserProfile(String username);
    UserProfileResponse updateUserProfile(String username, UpdateProfileRequest request);
    SettingsResponse getSettings(String username);
    SettingsResponse updateSettings(String username, UpdateSettingsRequest request);
    void updatePassword(String username, UpdatePasswordRequest request);
}
