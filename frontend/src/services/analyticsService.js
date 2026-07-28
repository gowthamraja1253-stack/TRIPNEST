import api from './apiClient';

export const analyticsService = {
  getDashboardStats: async () => {
    const response = await api.get('/analytics/dashboard/stats');
    return response.data.data;
  },

  getTripAnalytics: async (tripId) => {
    const response = await api.get(`/analytics/trips/${tripId}`);
    return response.data.data;
  },

  getUserGlobalAnalytics: async () => {
    const response = await api.get('/analytics/reports');
    return response.data.data;
  }
};
