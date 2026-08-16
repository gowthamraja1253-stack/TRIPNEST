package com.tripnest.user.service;

import com.tripnest.exception.ResourceNotFoundException;
import com.tripnest.user.dto.SettingsResponse;
import com.tripnest.user.dto.UpdateProfileRequest;
import com.tripnest.user.dto.UpdateSettingsRequest;
import com.tripnest.user.dto.UpdatePasswordRequest;
import com.tripnest.user.dto.UserProfileResponse;
import com.tripnest.user.entity.User;
import com.tripnest.user.entity.UserPreference;
import com.tripnest.user.mapper.UserMapper;
import com.tripnest.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import com.tripnest.exception.BadRequestException;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, UserMapper userMapper, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.userMapper = userMapper;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getUserProfile(String username) {
        User user = userRepository.findWithPreferenceByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return userMapper.toProfileResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateUserProfile(String username, UpdateProfileRequest request) {
        User user = userRepository.findWithPreferenceByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        // Update user properties
        userMapper.updateUserFromRequest(request, user);

        // Update or initialize preferences
        UserPreference preference = user.getPreference();
        if (preference == null) {
            preference = new UserPreference();
            user.setPreference(preference);
        }
        preference.setTravelPreferences(request.getTravelPreferences());
        preference.setFavoriteDestinations(request.getFavoriteDestinations());

        User savedUser = userRepository.save(user);
        return userMapper.toProfileResponse(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public SettingsResponse getSettings(String username) {
        User user = userRepository.findWithPreferenceByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        UserPreference preference = user.getPreference();
        if (preference == null) {
            preference = new UserPreference();
            preference.setUser(user); // Initialize defaults
        }
        return userMapper.toSettingsResponse(preference);
    }

    @Override
    @Transactional
    public SettingsResponse updateSettings(String username, UpdateSettingsRequest request) {
        User user = userRepository.findWithPreferenceByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        UserPreference preference = user.getPreference();
        if (preference == null) {
            preference = new UserPreference();
            user.setPreference(preference);
        }
        
        userMapper.updateSettingsFromRequest(request, preference);
        
        // Save the user (which cascades to preference)
        userRepository.save(user);
        
        return userMapper.toSettingsResponse(preference);
    }

    @Override
    @Transactional
    public void updatePassword(String username, UpdatePasswordRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Incorrect current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
