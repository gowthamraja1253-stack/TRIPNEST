import { apiClient } from './apiClient';

export const supportService = {
  createTicket: async (ticketData) => {
    return await apiClient.post('/support/tickets', ticketData);
  },

  getUserTickets: async () => {
    return await apiClient.get('/support/tickets');
  },

  getTicket: async (ticketId) => {
    return await apiClient.get(`/support/tickets/${ticketId}`);
  },

  addMessage: async (ticketId, messageData) => {
    return await apiClient.post(`/support/tickets/${ticketId}/messages`, messageData);
  },

  getTicketMessages: async (ticketId) => {
    return await apiClient.get(`/support/tickets/${ticketId}/messages`);
  }
};
