import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, AlertCircle, Loader2, ArrowRight, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import { tripService } from '../../services/tripService';
import { formatCurrency } from '../../utils/formatters';

export default function BudgetDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const data = await tripService.getUserTrips();
      // Only keep trips that have a budget set
      setTrips((data || []).filter(t => t.budget > 0));
    } catch (error) {
      console.error('Failed to load trips for budget:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-3">
            <Wallet size={28} className="text-brand-500" />
            Trip Budgets
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Monitor and manage your spending limits across all your trips.
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/dashboard/reports')} className="flex items-center gap-2">
          <TrendingUp size={18} />
          View Global Analytics
        </Button>
      </div>

      {trips.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-16 h-16 mx-auto rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-4">
            <Wallet size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">No Budgets Set</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">You don't have any trips with an active budget.</p>
          <Button variant="primary" onClick={() => navigate('/dashboard/trips')}>
            Go to Trips
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {trips.map(trip => (
            <motion.div
              key={trip.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{trip.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{trip.destinationName}</p>
                </div>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate(`/dashboard/expenses?tripId=${trip.id}`)}
                  className="flex items-center gap-1.5 text-brand-600"
                >
                  Manage Expenses <ArrowRight size={16} />
                </Button>
              </div>

              {/* Note: In a complete implementation, total spent would come from backend per trip. 
                  Since tripService.getUserTrips doesn't include spent amount, we mock it visually or 
                  would need an expanded DTO. For Phase 4 demo, we show the budget bar. */}
              
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Budget Target</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(trip.budget)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">Status</p>
                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium">
                    <DollarSign size={12} /> Active
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl flex items-start gap-3">
                <AlertCircle className="text-brand-500 shrink-0 mt-0.5" size={18} />
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To view detailed spending breakdowns, categories, and trends for this trip, visit the global Analytics tab or log expenses in the Expenses dashboard.
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
