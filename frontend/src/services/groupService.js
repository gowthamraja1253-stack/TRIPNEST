import { apiClient } from './apiClient';

export const groupService = {
  getUserGroups: async () => {
    return await apiClient.get('/groups');
  },

  getGroupDetails: async (id) => {
    return await apiClient.get(`/groups/${id}`);
  },

  createGroup: async (groupData) => {
    return await apiClient.post('/groups', groupData);
  },

  updateGroup: async (id, groupData) => {
    return await apiClient.put(`/groups/${id}`, groupData);
  },

  deleteGroup: async (id) => {
    return await apiClient.delete(`/groups/${id}`);
  },

  inviteMember: async (groupId, usernameOrEmail) => {
    return await apiClient.post(`/groups/${groupId}/members`, { usernameOrEmail, role: 'MEMBER' });
  },

  inviteByEmail: async (groupId, email, tripId) => {
    return await apiClient.post(`/groups/${groupId}/invitations/email`, { email, tripId });
  },

  getPendingInvitations: async () => {
    return await apiClient.get('/groups/invitations/pending');
  },

  getGroupInvitations: async (groupId) => {
    return await apiClient.get(`/groups/${groupId}/invitations`);
  },

  acceptInvitation: async (invitationId) => {
    return await apiClient.put(`/groups/invitations/${invitationId}/accept`);
  },

  rejectInvitation: async (invitationId) => {
    return await apiClient.put(`/groups/invitations/${invitationId}/reject`);
  },

  cancelInvitation: async (groupId, invitationId) => {
    return await apiClient.delete(`/groups/${groupId}/invitations/${invitationId}`);
  },

  updateMemberRole: async (groupId, memberId, role) => {
    return await apiClient.put(`/groups/${groupId}/members/${memberId}/role?role=${role}`);
  },

  transferOwnership: async (groupId, newAdminMemberId) => {
    return await apiClient.put(`/groups/${groupId}/transfer-ownership?newAdminMemberId=${newAdminMemberId}`);
  },

  removeMember: async (groupId, memberId) => {
    return await apiClient.delete(`/groups/${groupId}/members/${memberId}`);
  },

  leaveGroup: async (groupId) => {
    return await apiClient.post(`/groups/${groupId}/leave`);
  },

  getGroupMessages: async (groupId) => {
    return await apiClient.get(`/groups/${groupId}/messages`);
  },

  sendGroupMessage: async (groupId, message) => {
    return await apiClient.post(`/groups/${groupId}/messages`, { message });
  }
};
