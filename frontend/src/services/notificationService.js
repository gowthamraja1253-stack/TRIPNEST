import api from './apiClient';

export const notificationService = {
  getUserNotifications: async () => {
    return await api.get('/notifications');
  },

  getUnreadNotifications: async () => {
    return await api.get('/notifications/unread');
  },

  getUnreadCount: async () => {
    return await api.get('/notifications/unread/count');
  },

  markAsRead: async (id) => {
    return await api.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return await api.put('/notifications/read-all');
  },

  deleteNotification: async (id) => {
    return await api.delete(`/notifications/${id}`);
  }
};
