import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Receipt, Plus, Trash2, Edit, X, DollarSign, Plane, Coffee, ShoppingBag, 
  Music, HelpCircle, Building, Users, Check, ArrowRight, AlertTriangle 
} from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tripService } from '../../services/tripService';
import { expenseService } from '../../services/expenseService';
import { budgetService } from '../../services/budgetService';
import { groupService } from '../../services/groupService';
import { formatINR } from '../../utils/currency';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SEO from '../../components/ui/SEO';
import { useToast } from '../../components/ui/ToastProvider';

const CATEGORIES = [
  { value: 'TRANSPORTATION', label: 'Transportation', icon: Plane, color: 'bg-blue-100 text-blue-600' },
  { value: 'HOTEL', label: 'Hotel', icon: Building, color: 'bg-purple-100 text-purple-600' },
  { value: 'FOOD', label: 'Food', icon: Coffee, color: 'bg-orange-100 text-orange-600' },
  { value: 'SHOPPING', label: 'Shopping', icon: ShoppingBag, color: 'bg-pink-100 text-pink-600' },
  { value: 'ENTERTAINMENT', label: 'Entertainment', icon: Music, color: 'bg-emerald-100 text-emerald-600' },
  { value: 'MISCELLANEOUS', label: 'Miscellaneous', icon: HelpCircle, color: 'bg-black/10 dark:bg-white/10 text-gray-600' }
];

const getCategoryMeta = (cat) => CATEGORIES.find(c => c.value === cat) || CATEGORIES[5];

export default function ExpensesDashboard() {
  const [searchParams] = useSearchParams();
  const initialTripIdParam = searchParams.get('tripId');
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState(initialTripIdParam ? Number(initialTripIdParam) : null);
  const [activeBudget, setActiveBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [groupMembers, setGroupMembers] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('FOOD');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);

  // Payer Mode & Selections
  const [payerMode, setPayerMode] = useState('single'); // 'single' | 'multiple'
  const [singlePayerUsername, setSinglePayerUsername] = useState('');
  const [multiPayersMap, setMultiPayersMap] = useState({});

  // Split Mode & Selections
  const [splitMode, setSplitMode] = useState('equal'); // 'equal' | 'custom'
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [customSharesMap, setCustomSharesMap] = useState({});

  const { addToast } = useToast();

  const storedUserStr = sessionStorage.getItem('tripnest_user') || localStorage.getItem('tripnest_user');
  const currentUser = storedUserStr ? JSON.parse(storedUserStr) : null;
  const currentUsername = currentUser?.username || localStorage.getItem('username');

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const data = await tripService.getTrips();
        setTrips(data || []);
        if (data && data.length > 0) {
          if (!selectedTripId || !data.some(t => t.id === selectedTripId)) {
            setSelectedTripId(data[0].id);
          }
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
    const fetchTripData = async () => {
      try {
        const [expenseData, budgetData, userGroups] = await Promise.all([
          expenseService.getExpensesByTrip(selectedTripId),
          budgetService.getBudgetByTrip(selectedTripId).catch(() => null),
          groupService.getUserGroups().catch(() => [])
        ]);
        setExpenses(expenseData || []);
        setActiveBudget(budgetData);

        // Find linked group members
        const linkedGroup = (userGroups || []).find(g => g.tripId === selectedTripId);
        if (linkedGroup && linkedGroup.id) {
          const gDetails = await groupService.getGroupDetails(linkedGroup.id).catch(() => null);
          if (gDetails) {
            setActiveGroup(gDetails);
            setGroupMembers(gDetails.members || []);
            setSelectedParticipants((gDetails.members || []).map(m => m.username));
          }
        } else {
          setActiveGroup(null);
          setGroupMembers([{ id: 1, username: currentUsername, firstName: 'Me' }]);
          setSelectedParticipants([currentUsername]);
        }
      } catch (err) {
        console.error('Failed to load expenses or budget', err);
      }
    };
    fetchTripData();
  }, [selectedTripId]);

  const selectedTrip = trips.find(t => t.id === selectedTripId);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Read planned category budget sum if configured to ensure exact sync with Budget Dashboard
  const savedCatBudgetsStr = localStorage.getItem(`tripnest_category_budgets_${selectedTripId}`);
  let categoryPlannedTotal = 0;
  if (savedCatBudgetsStr) {
    try {
      const catObj = JSON.parse(savedCatBudgetsStr);
      categoryPlannedTotal = Object.values(catObj).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
    } catch (e) {
      // ignore
    }
  }

  const budget = categoryPlannedTotal > 0 ? categoryPlannedTotal : (selectedTrip?.budget || activeBudget?.totalBudget || 0);
  const remaining = budget - totalExpenses;
  const percentUsed = budget > 0 ? Math.min((totalExpenses / budget) * 100, 100) : 0;

  // Capacity Enforcement: Require all trip mates to be added before recording expenses
  const targetTravelerCount = selectedTrip?.maxTravelers || activeGroup?.maxTravelers || (selectedTrip?.travelers ? Number(selectedTrip.travelers) : 1);
  const currentMemberCount = activeGroup ? groupMembers.length : 1;
  const isAllMembersAdded = targetTravelerCount <= 1 || (activeGroup && currentMemberCount >= targetTravelerCount);

  const openAddModal = () => {
    if (!isAllMembersAdded) {
      addToast(`Please add all ${targetTravelerCount} trip mates to your travel group first before recording expenses.`, 'warning');
      return;
    }
    setEditingExpense(null);
    setFormTitle('');
    setFormAmount('');
    setFormDesc('');
    setFormCategory('FOOD');
    setFormDate(new Date().toISOString().split('T')[0]);
    setPayerMode('single');
    setSinglePayerUsername(currentUsername);
    setMultiPayersMap({});
    setSplitMode('equal');
    setSelectedParticipants(groupMembers.map(m => m.username));
    setCustomSharesMap({});
    setShowModal(true);
  };

  const handleToggleParticipant = (username) => {
    if (selectedParticipants.includes(username)) {
      if (selectedParticipants.length === 1) return; // Must have at least 1 participant
      setSelectedParticipants(selectedParticipants.filter(u => u !== username));
    } else {
      setSelectedParticipants([...selectedParticipants, username]);
    }
  };

  const handleSave = async () => {
    if (!formAmount || parseFloat(formAmount) <= 0 || (!formTitle && !formDesc)) {
      addToast('Please enter title and valid expense amount', 'error');
      return;
    }
    const totalAmt = parseFloat(formAmount);

    // Validate Multiple Payers sum
    if (payerMode === 'multiple') {
      const sumPaid = Object.values(multiPayersMap).reduce((acc, v) => acc + (parseFloat(v) || 0), 0);
      if (Math.abs(sumPaid - totalAmt) > 0.01) {
        addToast(`The sum of amounts paid by members (₹${sumPaid}) must equal the total expense amount (₹${totalAmt}).`, 'error');
        return;
      }
    }

    // Validate Custom Splits sum
    if (splitMode === 'custom') {
      // Keep only custom shares of selected participants
      const cleanedCustom = {};
      selectedParticipants.forEach(u => {
        cleanedCustom[u] = parseFloat(customSharesMap[u]) || 0;
      });
      const sumOwed = Object.values(cleanedCustom).reduce((acc, v) => acc + v, 0);
      if (Math.abs(sumOwed - totalAmt) > 0.01) {
        addToast(`The sum of custom split shares (₹${sumOwed}) must equal the total expense amount (₹${totalAmt}).`, 'error');
        return;
      }
    }

    setIsSaving(true);
    try {
      // Build Paid By Map
      let paidByMap = {};
      if (payerMode === 'single') {
        paidByMap[singlePayerUsername || currentUsername] = totalAmt;
      } else {
        // Filter out zero payments
        Object.keys(multiPayersMap).forEach(k => {
          if (multiPayersMap[k] > 0) {
            paidByMap[k] = multiPayersMap[k];
          }
        });
      }

      // Build Split Shares Map
      let splitSharesMap = {};
      if (splitMode === 'equal') {
        const perPersonShare = totalAmt / (selectedParticipants.length || 1);
        selectedParticipants.forEach(u => {
          splitSharesMap[u] = perPersonShare;
        });
      } else {
        selectedParticipants.forEach(u => {
          if (customSharesMap[u] > 0) {
            splitSharesMap[u] = customSharesMap[u];
          }
        });
      }

      const expenseData = {
        title: formTitle || formDesc,
        amount: totalAmt,
        description: formDesc || formTitle,
        category: formCategory,
        date: formDate,
        paidByMap,
        splitSharesMap
      };

      let added = null;
      if (editingExpense) {
        added = await expenseService.updateExpense(selectedTripId, editingExpense.id, expenseData);
        setExpenses(prev => prev.map(e => e.id === added.id ? added : e));
      } else {
        added = await expenseService.addExpense(selectedTripId, expenseData);
        setExpenses(prev => [...prev, added]);
      }

      setShowModal(false);
      addToast('Expense & Split saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save expense', err);
      addToast('Failed to save expense', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Delete this recorded expense?')) return;
    try {
      await expenseService.deleteExpense(selectedTripId, expenseId);
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      addToast('Expense deleted', 'info');
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

  return (
    <div className="space-y-8 pb-8 max-w-6xl mx-auto w-full overflow-hidden">
      <SEO title="Expense Tracker" description="Record, track, and split travel expenses with custom member shares." />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-3">
            <Receipt className="text-primary" size={32} />
            Expense Tracker & Multi-Payer Splitter
          </h1>
          <p className="text-text-secondary mt-1">Record travel expenses, select who paid, and split custom shares among trip mates.</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedTripId || ''}
            onChange={e => setSelectedTripId(Number(e.target.value))}
            className="p-3 bg-surface border border-border rounded-xl text-text outline-none focus:border-primary text-sm font-medium shadow-sm"
          >
            {trips.map(t => (
              <option key={t.id} value={t.id}>{t.title || t.name || t.destination}</option>
            ))}
          </select>

          <Button
            variant="primary"
            glow
            onClick={openAddModal}
            disabled={!isAllMembersAdded}
            className={`flex items-center gap-2 ${!isAllMembersAdded ? 'opacity-50 cursor-not-allowed bg-black/40 dark:bg-white/40' : ''}`}
          >
            <Plus size={18} /> Add Expense & Split
          </Button>
        </div>
      </div>

      {/* ── Banner: Add All Trip Mates First Enforcement ── */}
      {!isAllMembersAdded && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-500/10 border border-amber-500/30 rounded-[20px] p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Users className="text-amber-600 shrink-0" size={24} />
            <div>
              <h4 className="font-bold text-amber-900 text-base">
                Add All Trip Mates First ({currentMemberCount}/{targetTravelerCount} Added)
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Please add all {targetTravelerCount} trip mates to your group before adding expenses to ensure split calculations are accurate across all co-travelers.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(activeGroup ? `/dashboard/groups/${activeGroup.id}` : '/dashboard/groups')}
            className="bg-surface border-amber-300 text-amber-800 hover:bg-amber-100 shrink-0 text-xs font-bold"
          >
            {activeGroup ? 'Add Trip Mates' : 'Create Group & Add Mates'} <ArrowRight size={14} className="ml-1" />
          </Button>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-surface rounded-[20px] border border-border p-6 shadow-sm">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Total Spent</p>
          <p className="text-3xl font-heading font-bold text-text">{formatINR(totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-surface rounded-[20px] border border-border p-6 shadow-sm">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Target Budget</p>
          <p className="text-3xl font-heading font-bold text-text">{formatINR(budget)}</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-surface rounded-[20px] border border-border p-6 shadow-sm">
          <p className="text-text-secondary text-xs font-semibold uppercase tracking-wider mb-1">Remaining Balance</p>
          <p className={`text-3xl font-heading font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatINR(remaining)}</p>
        </motion.div>
      </div>

      {/* Recorded Expenses Table */}
      <div className="bg-surface rounded-[24px] border border-border p-6 shadow-sm space-y-4">
        <h3 className="text-xl font-heading font-bold text-text">Recorded Expense Log</h3>

        {expenses.length === 0 ? (
          <div className="text-center py-12 text-text-secondary text-sm space-y-3">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto" />
            <p>No expenses recorded yet for this trip.</p>
            <Button variant="primary" onClick={openAddModal} disabled={!isAllMembersAdded}>Add Your First Expense</Button>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {expenses.map(exp => {
              const meta = getCategoryMeta(exp.category);
              const Icon = meta.icon;

              return (
                <div key={exp.id} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${meta.color} flex items-center justify-center shrink-0`}>
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-text text-base">{exp.title || exp.description}</h4>
                      <p className="text-xs text-text-secondary">
                        Paid by <span className="font-semibold text-primary">{exp.paidBy || exp.userUsername || 'Member'}</span> · {exp.expenseDate || exp.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-heading font-bold text-text text-lg">{formatINR(exp.amount)}</span>
                    <button onClick={() => handleDelete(exp.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── ADD / EDIT EXPENSE & SPLIT MODAL ── */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => !isSaving && setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              className="bg-surface rounded-[24px] p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6 border-b border-border pb-4">
                <div className="flex items-center gap-2">
                  <Receipt className="text-primary" size={24} />
                  <h3 className="text-xl font-heading font-bold text-text">Record Expense & Split</h3>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-text rounded-full">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <Input
                  label="Expense Title *"
                  placeholder="e.g. Flight Tickets / Dinner at Beach Shack"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  required
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Total Amount (INR) *"
                    placeholder="e.g. 2400"
                    type="number"
                    value={formAmount}
                    onChange={e => setFormAmount(e.target.value)}
                    required
                  />

                  <div>
                    <label className="block text-sm font-semibold text-text mb-1.5">Category *</label>
                    <select
                      value={formCategory}
                      onChange={e => setFormCategory(e.target.value)}
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary"
                    >
                      {CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* ── PAID BY WHOM SECTION ── */}
                <div className="pt-3 border-t border-border">
                  <label className="block text-sm font-bold text-text mb-2">Paid By Whom?</label>
                  <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl border border-border mb-3">
                    <button
                      type="button"
                      onClick={() => setPayerMode('single')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        payerMode === 'single' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
                      }`}
                    >
                      Single Payer
                    </button>
                    <button
                      type="button"
                      onClick={() => setPayerMode('multiple')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        payerMode === 'multiple' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
                      }`}
                    >
                      Multiple Payers
                    </button>
                  </div>

                  {payerMode === 'single' ? (
                    <select
                      value={singlePayerUsername}
                      onChange={e => setSinglePayerUsername(e.target.value)}
                      className="w-full p-3 bg-black/5 dark:bg-white/5 border border-border rounded-xl text-sm font-medium outline-none focus:border-primary"
                    >
                      {groupMembers.map(m => (
                        <option key={m.id || m.username} value={m.username}>
                          {m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.username} (Paid Full)
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-border">
                      {groupMembers.map(m => (
                        <div key={m.id || m.username} className="flex items-center justify-between text-xs font-semibold">
                          <span>{m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.username}</span>
                          <input
                            type="number"
                            placeholder="Amount Paid (₹)"
                            value={multiPayersMap[m.username] || ''}
                            onChange={e => setMultiPayersMap({ ...multiPayersMap, [m.username]: parseFloat(e.target.value) || 0 })}
                            className="w-32 p-1.5 bg-surface border border-border rounded-lg text-right font-bold"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                           {/* ── SPLIT AMONG MEMBERS SECTION ── */}
                <div className="pt-3 border-t border-border space-y-2">
                  <label className="block text-sm font-bold text-text">Split Among Members</label>
                  <p className="text-xs text-text-secondary">Select who participated in this expense:</p>

                  <div className="space-y-2 max-h-44 overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-border">
                    {groupMembers.map(m => {
                      const isSelected = selectedParticipants.includes(m.username);
                      return (
                        <div
                          key={m.id || m.username}
                          onClick={() => handleToggleParticipant(m.username)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-primary/10 border border-primary/30 text-primary font-bold' : 'bg-surface text-text-secondary border border-border'
                          }`}
                        >
                          <span className="text-xs">{m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.username}</span>
                          {isSelected && <Check size={14} className="text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ── SPLIT MODE SELECTION ── */}
                <div className="pt-3 border-t border-border space-y-3">
                  <label className="block text-sm font-bold text-text mb-1">Owed Split Mode</label>
                  <div className="flex bg-black/10 dark:bg-white/10 p-1 rounded-xl border border-border mb-3">
                    <button
                      type="button"
                      onClick={() => setSplitMode('equal')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        splitMode === 'equal' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
                      }`}
                    >
                      Split Equally
                    </button>
                    <button
                      type="button"
                      onClick={() => setSplitMode('custom')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                        splitMode === 'custom' ? 'bg-surface text-primary shadow-sm' : 'text-text-secondary'
                      }`}
                    >
                      Split Custom (Unequally)
                    </button>
                  </div>

                  {splitMode === 'custom' && (
                    <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-black/5 dark:bg-white/5 rounded-xl border border-border">
                      {groupMembers
                        .filter(m => selectedParticipants.includes(m.username))
                        .map(m => (
                          <div key={m.id || m.username} className="flex items-center justify-between text-xs font-semibold">
                            <span>{m.firstName ? `${m.firstName} ${m.lastName || ''}` : m.username}</span>
                            <input
                              type="number"
                              placeholder="Owed Share (₹)"
                              value={customSharesMap[m.username] || ''}
                              onChange={e => setCustomSharesMap({ ...customSharesMap, [m.username]: parseFloat(e.target.value) || 0 })}
                              className="w-32 p-1.5 bg-surface border border-border rounded-lg text-right font-bold"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
                  <Button variant="outline" type="button" onClick={() => setShowModal(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                  <Button variant="primary" glow onClick={handleSave} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save Expense & Split'}
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
