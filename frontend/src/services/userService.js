import { apiClient } from './apiClient';

export const userService = {
  getUserProfile: async () => {
    return await apiClient.get('/users/profile');
  },

  updateUserProfile: async (profileData) => {
    return await apiClient.put('/users/profile', profileData);
  },

  getTravelHistory: async () => {
    return await apiClient.get('/users/profile/history');
  },

  getSettings: async () => {
    return await apiClient.get('/users/settings');
  },

  updateSettings: async (settingsData) => {
    return await apiClient.put('/users/settings', settingsData);
  }
};
