import { apiClient } from './apiClient';

export const documentService = {
  uploadDocument: async (formData) => {
    try {
      // Use raw fetch / custom axios header for multipart form data if needed or apiClient.post
      const data = await apiClient.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      console.error("Failed to upload document", error);
      throw error;
    }
  },

  getDocuments: async (params = {}) => {
    try {
      const data = await apiClient.get('/documents', { params });
      return data || [];
    } catch (error) {
      console.error("Failed to fetch documents", error);
      return [];
    }
  },

  getDocumentById: async (id) => {
    try {
      return await apiClient.get(`/documents/${id}`);
    } catch (error) {
      console.error(`Failed to fetch document ${id}`, error);
      throw error;
    }
  },

  deleteDocument: async (id) => {
    try {
      await apiClient.delete(`/documents/${id}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete document ${id}`, error);
      throw error;
    }
  }
};
