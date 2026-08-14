import apiClient from './apiClient';

export const aiService = {
  chat: async (message, conversationHistory = []) => {
    try {
      const response = await apiClient.post('/ai/chat', {
        message,
        conversationHistory
      });
      return response;
    } catch (error) {
      console.error('AI chat error:', error);
      throw error;
    }
  }
};
