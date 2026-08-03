import { apiClient } from './apiClient';

const mapBackendBudgetToFrontend = (b) => {
  if (!b) return null;
  return {
    id: b.id,
    tripId: b.tripId,
    userId: b.userId,
    totalBudget: b.totalBudget || 0,
    spentAmount: b.spentAmount || 0,
    remainingAmount: b.remainingAmount !== undefined ? b.remainingAmount : (b.totalBudget - (b.spentAmount || 0)),
    startDate: b.startDate || '',
    endDate: b.endDate || '',
    status: b.status || 'ACTIVE',
    createdAt: b.createdAt,
    updatedAt: b.updatedAt
  };
};

export const budgetService = {
  createBudget: async (budgetData) => {
    const payload = {
      tripId: Number(budgetData.tripId),
      totalBudget: parseFloat(budgetData.totalBudget) || 0,
      startDate: budgetData.startDate || null,
      endDate: budgetData.endDate || null
    };
    const data = await apiClient.post('/budgets', payload);
    return mapBackendBudgetToFrontend(data);
  },

  updateBudget: async (budgetId, budgetData) => {
    const payload = {
      tripId: Number(budgetData.tripId),
      totalBudget: parseFloat(budgetData.totalBudget) || 0,
      startDate: budgetData.startDate || null,
      endDate: budgetData.endDate || null
    };
    const data = await apiClient.put(`/budgets/${budgetId}`, payload);
    return mapBackendBudgetToFrontend(data);
  },

  getBudgetByTrip: async (tripId) => {
    try {
      const data = await apiClient.get(`/budgets/trip/${tripId}`);
      return mapBackendBudgetToFrontend(data);
    } catch (error) {
      if (error.response?.status === 404 || error.status === 404) {
        return null;
      }
      console.warn(`No active budget found for trip ${tripId}`);
      return null;
    }
  },

  getBudgetSummary: async (tripId) => {
    try {
      const data = await apiClient.get(`/budgets/trip/${tripId}/summary`);
      return data;
    } catch (error) {
      console.warn(`No budget summary found for trip ${tripId}`);
      return null;
    }
  },

  deleteBudget: async (budgetId) => {
    await apiClient.delete(`/budgets/${budgetId}`);
    return true;
  }
};
