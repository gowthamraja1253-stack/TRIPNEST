import api from './apiClient';

export const mediaService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Use the api instance but override headers for multipart/form-data
    // Axios automatically sets the Content-Type to multipart/form-data with the correct boundary when passing FormData
    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },
};
