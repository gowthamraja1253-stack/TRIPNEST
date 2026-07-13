import { apiClient } from './apiClient';

// Map backend ExpenseResponse to frontend model
const mapBackendExpenseToFrontend = (exp) => {
  if (!exp) return null;
  return {
    id: exp.id,
    tripId: exp.tripId,
    amount: exp.amount || 0,
    description: exp.description || '',
    category: exp.category || 'MISCELLANEOUS',
    date: exp.expenseDate || ''
  };
};

export const expenseService = {
  getExpensesByTrip: async (tripId) => {
    try {
      const data = await apiClient.get(`/trips/${tripId}/expenses`);
      return (data || []).map(mapBackendExpenseToFrontend);
    } catch (error) {
      console.error(`Failed to load expenses for trip ${tripId}`, error);
      return [];
    }
  },

  addExpense: async (tripId, expense) => {
    const payload = {
      amount: parseFloat(expense.amount) || 0,
      description: expense.description || '',
      category: expense.category || 'MISCELLANEOUS',
      expenseDate: expense.date || new Date().toISOString().split('T')[0]
    };
    const data = await apiClient.post(`/trips/${tripId}/expenses`, payload);
    return mapBackendExpenseToFrontend(data);
  },

  updateExpense: async (tripId, expenseId, expense) => {
    const payload = {
      amount: parseFloat(expense.amount) || 0,
      description: expense.description || '',
      category: expense.category || 'MISCELLANEOUS',
      expenseDate: expense.date || new Date().toISOString().split('T')[0]
    };
    const data = await apiClient.put(`/trips/${tripId}/expenses/${expenseId}`, payload);
    return mapBackendExpenseToFrontend(data);
  },

  deleteExpense: async (tripId, expenseId) => {
    await apiClient.delete(`/trips/${tripId}/expenses/${expenseId}`);
    return true;
  }
};
