import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, DollarSign, Edit2, Plus, ArrowRight, PieChart, CheckCircle, 
  AlertTriangle, Filter, Save, CheckCircle2, TrendingUp, X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { tripService } from '../../services/tripService';
import { budgetService } from '../../services/budgetService';
import { expenseService } from '../../services/expenseService';
import { formatINR } from '../../utils/currency';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SEO from '../../components/ui/SEO';
import { useToast } from '../../components/ui/ToastProvider';

const CATEGORIES = [
  { id: 'TRANSPORTATION', name: 'Travel & Transport', icon: '🚆' },
  { id: 'HOTEL', name: 'Hotel & Stay', icon: '🏨' },
  { id: 'FOOD', name: 'Food & Dining', icon: '🍽️' },
  { id: 'SIGHTSEEING', name: 'Sightseeing & Tours', icon: '🗽' },
  { id: 'SHOPPING', name: 'Shopping', icon: '🛍️' },
  { id: 'ENTERTAINMENT', name: 'Entertainment & Activities', icon: '🎟️' },
  { id: 'MISCELLANEOUS', name: 'Miscellaneous', icon: '📦' }
];

export default function BudgetDashboard() {
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [loading, setLoading] = useState(true);

  // Category Budgets & Actual Expenses
  const [categoryBudgets, setCategoryBudgets] = useState({});
  const [categoryExpenses, setCategoryExpenses] = useState({});
  const [totalPlannedBudget, setTotalPlannedBudget] = useState(0);

  // Edit Category Budgets Modal
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingBudgets, setEditingBudgets] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const navigate = useNavigate();
  const { addToast } = useToast();

  const loadData = async () => {
    try {
      setLoading(true);
      const userTrips = await tripService.getTrips();
      setTrips(userTrips || []);

      if (userTrips && userTrips.length > 0) {
        const activeId = selectedTripId || userTrips[0].id.toString();
        if (!selectedTripId) setSelectedTripId(activeId);
        await loadTripBudget(activeId);
      }
    } catch (err) {
      console.error('Failed to load budget planning data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadTripBudget = async (tripId) => {
    try {
      // Load saved budget summary and recorded expenses
      const [summary, expList] = await Promise.all([
        budgetService.getBudgetSummary(tripId).catch(() => null),
        expenseService.getExpensesByTrip(tripId).catch(() => [])
      ]);

      // Calculate actual expenses by category
      const expMap = {};
      (expList || []).forEach(e => {
        const cat = (e.category || 'MISCELLANEOUS').toUpperCase();
        expMap[cat] = (expMap[cat] || 0) + (e.amount || 0);
      });
      setCategoryExpenses(expMap);

      const targetTrip = trips.find(t => t.id.toString() === tripId);
      const baseBudget = targetTrip?.budget || summary?.totalBudget || 100000;

      // Load saved category budget allocations from localStorage/state fallback
      const savedCatBudgets = localStorage.getItem(`tripnest_category_budgets_${tripId}`);
      let catBudgets = {};
      if (savedCatBudgets) {
        catBudgets = JSON.parse(savedCatBudgets);
      } else {
        // Default category breakdown (summing to 100% of baseBudget)
        catBudgets = {
          TRANSPORTATION: Math.round(baseBudget * 0.3),
          HOTEL: Math.round(baseBudget * 0.3),
          FOOD: Math.round(baseBudget * 0.15),
          SIGHTSEEING: Math.round(baseBudget * 0.1),
          SHOPPING: Math.round(baseBudget * 0.05),
          ENTERTAINMENT: Math.round(baseBudget * 0.05),
          MISCELLANEOUS: Math.round(baseBudget * 0.05)
        };
      }

      setCategoryBudgets(catBudgets);
      const catSum = Object.values(catBudgets).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      setTotalPlannedBudget(catSum > 0 ? catSum : baseBudget);
    } catch (err) {
      console.error('Failed to load trip budget details:', err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTripId) {
      loadTripBudget(selectedTripId);
    }
  }, [selectedTripId]);

  const handleSaveCategoryBudgets = async () => {
    if (!selectedTripId) return;
    setIsSaving(true);
    try {
      const sum = Object.values(editingBudgets).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      setTotalPlannedBudget(sum);
      setCategoryBudgets(editingBudgets);

      localStorage.setItem(`tripnest_category_budgets_${selectedTripId}`, JSON.stringify(editingBudgets));

      // Update backend target budget
      const payload = { tripId: parseInt(selectedTripId), totalBudget: sum };
      await budgetService.createBudget(payload).catch(() => {});

      addToast('Trip approx category budget saved successfully!', 'success');
      setShowPlanModal(false);
    } catch (err) {
      console.error('Failed to save category budgets:', err);
      addToast('Failed to save category budget plan', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const openPlanModal = () => {
    setEditingBudgets({ ...categoryBudgets });
    setShowPlanModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  const selectedTrip = trips.find(t => t.id.toString() === selectedTripId);
  const totalActualSpent = Object.values(categoryExpenses).reduce((acc, v) => acc + v, 0);
  const overallRemaining = totalPlannedBudget - totalActualSpent;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full overflow-hidden">
      <SEO title="Budget Management System" description="Plan approx budgets per category and compare against real travel expenses." />

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-3">
            <Wallet className="text-primary" size={32} />
            Budget Management System
          </h1>
          <p className="text-text-secondary mt-1 text-base">
            Set approx budgets for Travel, Hotels, Food, & Shopping, and compare against real recorded expenses.
          </p>
        </div>

        {/* Trip Selector Filter */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 bg-surface p-2 border border-border rounded-xl shadow-sm">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedTripId}
              onChange={e => setSelectedTripId(e.target.value)}
              className="bg-transparent text-sm font-bold text-text outline-none"
            >
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.destination || t.name}</option>
              ))}
            </select>
          </div>

          <Button variant="primary" glow onClick={openPlanModal} className="flex items-center gap-1.5 text-xs">
            <Edit2 size={16} /> Plan Category Budgets
          </Button>
        </div>
      </div>

      {/* Global Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Target Planned Budget</p>
          <p className="text-3xl font-heading font-bold text-text">{formatINR(totalPlannedBudget)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Actual Spent (From Expenses)</p>
          <p className="text-3xl font-heading font-bold text-primary">{formatINR(totalActualSpent)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface rounded-[20px] p-6 border border-border shadow-sm">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Remaining Balance</p>
          <p className={`text-3xl font-heading font-bold ${overallRemaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatINR(overallRemaining)}
          </p>
        </motion.div>
      </div>

      {/* ── Category Budget vs Actual Expense Comparison Table ── */}
      <div className="bg-surface rounded-[24px] border border-border p-6 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-4">
          <div>
            <h3 className="text-xl font-heading font-bold text-text">
              Category Budget Comparison - {selectedTrip?.destination || selectedTrip?.name || 'Trip'}
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">Approximate budget limits side-by-side with real recorded expenses.</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate(`/dashboard/expenses?tripId=${selectedTripId}`)}>
            Manage Expense Log <ArrowRight size={14} className="ml-1" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                <th className="py-3.5 px-4">Expense Category</th>
                <th className="py-3.5 px-4">Approx Planned Budget</th>
                <th className="py-3.5 px-4">Actual Spent (Real Expenses)</th>
                <th className="py-3.5 px-4">Variance / Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-medium">
              {CATEGORIES.map(cat => {
                const planned = categoryBudgets[cat.id] || 0;
                const actual = categoryExpenses[cat.id]; // undefined if not added yet
                const hasSpent = actual !== undefined && actual > 0;
                const diff = planned - (actual || 0);

                return (
                  <tr key={cat.id} className="hover:bg-black/5 dark:hover:bg-white/5">
                    <td className="py-4 px-4 font-bold text-text flex items-center gap-2">
                      <span className="text-lg">{cat.icon}</span>
                      <span>{cat.name}</span>
                    </td>
                    <td className="py-4 px-4 font-bold text-text">{formatINR(planned)}</td>
                    <td className="py-4 px-4 font-bold text-primary">
                      {hasSpent ? formatINR(actual) : <span className="text-gray-400 italic font-normal">Not added yet</span>}
                    </td>
                    <td className="py-4 px-4">
                      {!hasSpent ? (
                        <span className="px-3 py-1 bg-black/10 dark:bg-white/10 text-gray-500 rounded-full text-xs font-bold uppercase">
                          Pending Expenses
                        </span>
                      ) : diff >= 0 ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
                          <CheckCircle2 size={12} /> Under Budget ({formatINR(diff)})
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-500/10 text-red-600 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} /> Over Budget ({formatINR(Math.abs(diff))})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── PLAN CATEGORY BUDGETS MODAL ── */}
      <AnimatePresence>
        {showPlanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !isSaving && setShowPlanModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-[24px] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Wallet className="text-primary" size={24} />
                  <h3 className="text-xl font-heading font-bold text-text">Plan Approx Category Budgets</h3>
                </div>
                <button onClick={() => setShowPlanModal(false)} className="p-2 text-gray-400 hover:text-text rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-xs text-text-secondary">Enter how much money you plan to spend for each travel category:</p>

                {CATEGORIES.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between gap-4 p-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl">
                    <span className="font-bold text-sm text-text flex items-center gap-2">
                      <span>{cat.icon}</span> {cat.name}
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      value={editingBudgets[cat.id] || ''}
                      onChange={e => setEditingBudgets({ ...editingBudgets, [cat.id]: parseFloat(e.target.value) || 0 })}
                      className="w-32 p-2 bg-surface border border-border rounded-lg text-sm font-bold text-right outline-none focus:border-primary"
                    />
                  </div>
                ))}

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setShowPlanModal(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button variant="primary" glow onClick={handleSaveCategoryBudgets} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Category Budgets'}
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
