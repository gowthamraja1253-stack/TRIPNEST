import { apiClient } from './apiClient';

// Map backend ExpenseResponse to frontend model
const mapBackendExpenseToFrontend = (exp) => {
  if (!exp) return null;
  
  let parsedDesc = exp.description || exp.title || '';
  let paidByMap = null;
  let splitSharesMap = null;
  
  if (parsedDesc.includes(' ||SPLITS|| ')) {
    const parts = parsedDesc.split(' ||SPLITS|| ');
    parsedDesc = parts[0] || '';
    try {
      const splits = JSON.parse(parts[1]);
      paidByMap = splits.paidByMap || null;
      splitSharesMap = splits.splitSharesMap || null;
    } catch (e) {
      console.warn("Failed to parse splits from description", e);
    }
  }

  let friendlyPayer = exp.userUsername || 'Member';
  if (paidByMap) {
    const keys = Object.keys(paidByMap).filter(k => paidByMap[k] > 0);
    if (keys.length === 1) {
      friendlyPayer = keys[0];
    } else if (keys.length > 1) {
      friendlyPayer = 'Multiple';
    }
  }

  return {
    id: exp.id,
    tripId: exp.tripId,
    title: exp.title || 'Expense',
    amount: exp.amount || 0,
    description: parsedDesc,
    category: exp.category || 'MISCELLANEOUS',
    date: exp.expenseDate || '',
    paidBy: friendlyPayer,
    paidByMap,
    splitSharesMap
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
    let desc = expense.description || expense.title || '';
    if (expense.paidByMap || expense.splitSharesMap) {
      desc = desc + ' ||SPLITS|| ' + JSON.stringify({
        paidByMap: expense.paidByMap,
        splitSharesMap: expense.splitSharesMap
      });
    }
    const payload = {
      title: expense.title || expense.description || 'Expense',
      amount: parseFloat(expense.amount) || 0,
      description: desc,
      category: expense.category || 'MISCELLANEOUS',
      expenseDate: expense.date || new Date().toISOString().split('T')[0]
    };
    const data = await apiClient.post(`/trips/${tripId}/expenses`, payload);
    return mapBackendExpenseToFrontend(data);
  },

  updateExpense: async (tripId, expenseId, expense) => {
    let desc = expense.description || expense.title || '';
    if (expense.paidByMap || expense.splitSharesMap) {
      desc = desc + ' ||SPLITS|| ' + JSON.stringify({
        paidByMap: expense.paidByMap,
        splitSharesMap: expense.splitSharesMap
      });
    }
    const payload = {
      title: expense.title || expense.description || 'Expense',
      amount: parseFloat(expense.amount) || 0,
      description: desc,
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
