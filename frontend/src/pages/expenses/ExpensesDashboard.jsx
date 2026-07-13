import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Plus, Trash2, Edit, X, DollarSign, Plane, Coffee, ShoppingBag, Music, HelpCircle, Building } from 'lucide-react';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';
import { formatINR } from '../../utils/currency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const CATEGORIES = [
  { value: 'TRANSPORTATION', label: 'Transportation', icon: Plane, color: 'bg-blue-100 text-blue-600' },
  { value: 'HOTEL', label: 'Hotel', icon: Building, color: 'bg-purple-100 text-purple-600' },
  { value: 'FOOD', label: 'Food', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
  { value: 'SHOPPING', label: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: Music, color: 'bg-emerald-100 text-emerald-600' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous', icon: HelpCircle, color: 'bg-gray-100 text-gray-600' }
];

const getCategoryMeta = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[5];

export default function ExpensesDashboard() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('FOOD');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getTrips();
        setTrips(data);
        if (data.length > 0) {
          setSelectedTripId(data[0].id);
        }
      } catch (err) {
        console.error('Failed to load trips', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrips();
  }, []);

  useEffect(() => {
    if (!selectedTripId) return;
    const fetchExpenses = async () => {
      try {
        const data = await expenseService.getExpensesByTrip(selectedTripId);
        setExpenses(data);
      } catch (err) {
        console.error('Failed to load expenses', err);
      }
    };
    fetchExpenses();
  }, [selectedTripId]);

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const budget = selectedTrip?.budget || 0;
  const remaining = budget - totalExpenses;
  const percentUsed = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;

  const categoryBreakdown = CATEGORIES.map(cat => ({
    ...cat,
    total: expenses.filter(e => e.category === cat.value).reduce((sum, e) => sum + e.amount, 0)
  })).filter(c => c.total > 0);

  const openAddModal = () => {
    setEditingExpense(null);
    setFormAmount('');
    setFormDesc('');
    setFormCategory('FOOD');
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEditModal = (expense) => {
    setEditingExpense(expense);
    setFormAmount(String(expense.amount));
    setFormDesc(expense.description);
    setFormCategory(expense.category);
    setFormDate(expense.date);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formAmount || !formDesc) return;
    setIsSaving(true);
    try {
      const expenseData = {
        amount: formAmount,
        description: formDesc,
        category: formCategory,
        date: formDate
      };
      if (editingExpense) {
        const updated = await expenseService.updateExpense(selectedTripId, editingExpense.id, expenseData);
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
      } else {
        const added = await expenseService.addExpense(selectedTripId, expenseData);
        setExpenses(prev => [...prev, added]);
      }
      setShowModal(false);
    } catch (err) {
      console.error('Failed to save expense', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      await expenseService.deleteExpense(selectedTripId, expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
    } catch (err) {
      console.error('Failed to delete expense', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[60vh]">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  if (trips.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <EmptyState
          icon={Receipt}
          title="No Trips Found"
          message="Create a trip first to start tracking expenses."
          actionLabel="Create a Trip"
          onAction={() => window.location.href = '/dashboard/trips/create'}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text">Expense Tracker</h1>
          <p className="text-text-secondary mt-1">Track and manage your travel expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTripId || ''}
            onChange={e => setSelectedTripId(Number(e.target.value))}
            className="p-3 bg-white border border-border rounded-xl text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.name || t.destination}</option>
            ))}
          </select>
          <Button variant="primary" glow onClick={openAddModal} className="flex items-center gap-2">
            <Plus size={18} /> Add Expense
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-[20px] border border-border/50 p-6 shadow-sm">
          <p className="text-text-secondary text-sm font-medium mb-1">Total Spent</p>
          <p className="text-3xl font-heading font-bold text-text">{formatINR(totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-[20px] border border-border/50 p-6 shadow-sm">
          <p className="text-text-secondary text-sm font-medium mb-1">Budget</p>
          <p className="text-3xl font-heading font-bold text-text">{formatINR(budget)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className={`bg-white rounded-[20px] border border-border/50 p-6 shadow-sm`}>
          <p className="text-text-secondary text-sm font-medium mb-1">Remaining</p>
          <p className={`text-3xl font-heading font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatINR(remaining)}</p>
        </motion.div>
      </div>

      {/* Budget Progress Bar */}
      <div className="bg-white rounded-[20px] border border-border/50 p-6 shadow-sm">
        <div className="flex justify-between text-sm font-semibold mb-3">
          <span className="text-text-secondary">Budget Used</span>
          <span className={percentUsed > 90 ? 'text-red-600' : 'text-primary'}>{Math.round(percentUsed)}%</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={`h-full rounded-full ${percentUsed > 90 ? 'bg-red-500' : percentUsed > 70 ? 'bg-amber-500' : 'bg-primary'}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Expense List */}
        <div className="xl:col-span-2 space-y-4">
          <h2 className="text-xl font-heading font-bold text-text">Transactions</h2>
          {expenses.length === 0 ? (
            <div className="bg-white rounded-[20px] border border-border/50 p-10 text-center">
              <Receipt className="w-12 h-12 text-text-muted mx-auto mb-3" />
              <p className="text-text-secondary font-medium">No expenses logged yet.</p>
              <p className="text-text-muted text-sm mt-1">Click "Add Expense" to get started.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.sort((a, b) => (b.date || '').localeCompare(a.date || '')).map((expense, i) => {
                const cat = getCategoryMeta(expense.category);
                const IconComp = cat.icon;
                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-xl border border-border/50 p-4 flex items-center gap-4 hover:shadow-md transition-shadow group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${cat.color}`}>
                      <IconComp size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-text truncate">{expense.description}</p>
                      <p className="text-xs text-text-muted">{expense.date} · {cat.label}</p>
                    </div>
                    <p className="font-bold text-text whitespace-nowrap">{formatINR(expense.amount)}</p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEditModal(expense)} className="p-1.5 rounded-lg hover:bg-gray-100 text-text-secondary">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(expense.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Category Breakdown */}
        <div>
          <h2 className="text-xl font-heading font-bold text-text mb-4">By Category</h2>
          <div className="bg-white rounded-[20px] border border-border/50 p-6 shadow-sm space-y-4">
            {categoryBreakdown.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">No data yet.</p>
            ) : (
              categoryBreakdown.sort((a, b) => b.total - a.total).map(cat => {
                const IconComp = cat.icon;
                const catPercent = totalExpenses > 0 ? (cat.total / totalExpenses) * 100 : 0;
                return (
                  <div key={cat.value}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${cat.color}`}>
                          <IconComp size={14} />
                        </div>
                        <span className="text-sm font-medium text-text">{cat.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-text">{formatINR(cat.total)}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${catPercent}%` }}
                        transition={{ duration: 0.8 }}
                        className={`h-full rounded-full ${cat.color.includes('blue') ? 'bg-blue-500' : cat.color.includes('purple') ? 'bg-purple-500' : cat.color.includes('orange') ? 'bg-orange-500' : cat.color.includes('pink') ? 'bg-pink-500' : cat.color.includes('emerald') ? 'bg-emerald-500' : 'bg-gray-500'}`}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !isSaving && setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[20px] shadow-2xl border border-border p-6 sm:p-8 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-heading font-bold text-text">
                  {editingExpense ? 'Edit Expense' : 'Add Expense'}
                </h3>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-lg hover:bg-gray-100 text-text-secondary">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <Input
                  label="Amount (INR)"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formAmount}
                  onChange={e => setFormAmount(e.target.value)}
                  placeholder="e.g. 1500"
                />
                <Input
                  label="Description"
                  value={formDesc}
                  onChange={e => setFormDesc(e.target.value)}
                  placeholder="e.g. Lunch at restaurant"
                />
                <div>
                  <label className="block text-sm font-semibold text-text-secondary mb-2">Category</label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-border rounded-xl text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Date"
                  type="date"
                  value={formDate}
                  onChange={e => setFormDate(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={isSaving}>Cancel</Button>
                <Button variant="primary" glow onClick={handleSave} disabled={isSaving || !formAmount || !formDesc}>
                  <DollarSign size={16} className="mr-1" />
                  {isSaving ? 'Saving...' : (editingExpense ? 'Update' : 'Add Expense')}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
