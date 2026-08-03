import { apiClient } from './apiClient';

export const analyticsService = {
  getDashboardStats: async () => {
    try {
      return await apiClient.get('/analytics/dashboard/stats');
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return null;
    }
  },

  getTripAnalytics: async (tripId) => {
    try {
      return await apiClient.get(`/analytics/trips/${tripId}`);
    } catch (error) {
      console.error(`Failed to get trip analytics for ${tripId}:`, error);
      return null;
    }
  },

  getUserGlobalAnalytics: async () => {
    try {
      return await apiClient.get('/analytics/reports');
    } catch (error) {
      console.error('Failed to get global analytics:', error);
      return null;
    }
  },

  getAdminAnalytics: async () => {
    try {
      return await apiClient.get('/analytics/admin');
    } catch (error) {
      console.error('Failed to get admin analytics:', error);
      return null;
    }
  }
};
