import api from './apiClient';

export const groupService = {
  createGroup: async (groupData) => {
    const response = await api.post('/groups', groupData);
    return response.data.data;
  },

  getUserGroups: async () => {
    const response = await api.get('/groups');
    return response.data.data;
  },

  getGroupDetails: async (id) => {
    const response = await api.get(`/groups/${id}`);
    return response.data.data;
  },

  updateGroup: async (id, groupData) => {
    const response = await api.put(`/groups/${id}`, groupData);
    return response.data.data;
  },

  deleteGroup: async (id) => {
    const response = await api.delete(`/groups/${id}`);
    return response.data.data;
  },

  inviteMember: async (groupId, usernameOrEmail, role = 'MEMBER') => {
    const response = await api.post(`/groups/${groupId}/members`, { usernameOrEmail, role });
    return response.data.data;
  },

  removeMember: async (groupId, memberId) => {
    const response = await api.delete(`/groups/${groupId}/members/${memberId}`);
    return response.data.data;
  },

  leaveGroup: async (groupId) => {
    const response = await api.post(`/groups/${groupId}/leave`);
    return response.data.data;
  }
};
