import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart as RechartsPieChart, Pie, Cell, BarChart as RechartsBarChart, 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, Download, 
  Users, MapPin, Compass, Wallet, FileSpreadsheet, ShieldAlert, Filter
} from 'lucide-react';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import SEO from '../../components/ui/SEO';
import { analyticsService } from '../../services/analyticsService';
import { tripService } from '../../services/tripService';
import { formatINR } from '../../utils/currency';
import { useToast } from '../../components/ui/ToastProvider';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ReportsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState([]);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [report, setReport] = useState(null);
  const [adminStats, setAdminStats] = useState(null);
  const [viewMode, setViewMode] = useState('traveler'); // 'traveler' | 'admin'

  const { addToast } = useToast();

  // Check if current user is a Platform Admin (ROLE_ADMIN)
  const storedRoles = JSON.parse(localStorage.getItem('roles') || '[]');
  const isPlatformAdmin = storedRoles.includes('ROLE_ADMIN') || localStorage.getItem('role') === 'ROLE_ADMIN';

  const fetchTrips = async () => {
    try {
      const userTrips = await tripService.getTrips();
      setTrips(userTrips || []);
    } catch (err) {
      console.error('Failed to load trips for filter:', err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      let userReport = null;

      if (selectedTripId) {
        userReport = await analyticsService.getTripAnalytics(selectedTripId);
      } else {
        userReport = await analyticsService.getUserGlobalAnalytics();
      }

      setReport(userReport);

      if (isPlatformAdmin) {
        const adminData = await analyticsService.getAdminAnalytics();
        setAdminStats(adminData);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
      addToast('Failed to load analytics report', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedTripId]);

  const handleExportCSV = () => {
    if (!report) return;
    const selectedTrip = trips.find(t => t.id.toString() === selectedTripId);
    const reportTitle = selectedTrip ? `tripnest_report_${selectedTrip.destination || selectedTrip.name}` : 'tripnest_global_analytics_report';

    const rows = [
      ['Report Type', selectedTrip ? `Trip: ${selectedTrip.destination || selectedTrip.name}` : 'All Trips'],
      ['Metric', 'Value'],
      ['Total Spent', report.totalSpent || 0],
      ['Total Budget', report.totalBudget || 0],
      ['Remaining Budget', report.budgetRemaining || 0],
      ['Budget Utilized (%)', (report.budgetUsedPercentage || 0).toFixed(1)],
      [],
      ['Category', 'Amount (INR)'],
      ...Object.entries(report.expensesByCategory || {}).map(([cat, val]) => [cat, val])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportTitle}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('Report exported as CSV successfully!', 'success');
  };

  if (loading && !report) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <LoadingSpinner size="lg" className="text-primary" />
      </div>
    );
  }

  // Format category data for PieChart
  const categoryData = Object.entries(report?.expensesByCategory || {})
    .map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    .sort((a, b) => b.value - a.value);

  // Format monthly data for BarChart
  const monthlyData = Object.entries(report?.expensesByMonth || {})
    .map(([name, value]) => ({ name, amount: value }))
    .reverse();

  // Admin Top Destinations Data
  const topDestinationsData = Object.entries(adminStats?.topDestinations || {})
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 w-full overflow-hidden">
      <SEO title="Reports & Analytics" description="Gain insights into travel spending, budget utilization, and platform statistics." />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text flex items-center gap-3">
            <BarChart3 className="text-primary" size={32} />
            Reports & Analytics
          </h1>
          <p className="text-text-secondary mt-1">
            Visual statistics, category expense breakdowns, and travel performance insights.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Trip Selector Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-gray-400" />
            <select
              value={selectedTripId}
              onChange={e => setSelectedTripId(e.target.value)}
              className="p-2 bg-white border border-border rounded-xl text-xs font-semibold outline-none focus:border-primary text-text shadow-sm"
            >
              <option value="">All Trips</option>
              {trips.map(t => (
                <option key={t.id} value={t.id}>{t.destination || t.name}</option>
              ))}
            </select>
          </div>

          {/* Platform Admin Toggle (Only visible if user is a Platform Admin) */}
          {isPlatformAdmin && (
            <div className="bg-gray-100 p-1 rounded-xl flex border border-border">
              <button
                onClick={() => setViewMode('traveler')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'traveler' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'
                }`}
              >
                My Travel Insights
              </button>
              <button
                onClick={() => setViewMode('admin')}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'admin' ? 'bg-white text-primary shadow-sm' : 'text-text-secondary'
                }`}
              >
                Platform Admin
              </button>
            </div>
          )}

          <Button variant="outline" onClick={handleExportCSV} className="flex items-center gap-2 text-xs">
            <Download size={16} /> Export CSV
          </Button>
        </div>
      </div>

      {viewMode === 'traveler' ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                <TrendingUp size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Spent</p>
              <h3 className="text-2xl font-heading font-bold text-text">{formatINR(report?.totalSpent || 0)}</h3>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                <Wallet size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Budget</p>
              <h3 className="text-2xl font-heading font-bold text-text">{formatINR(report?.totalBudget || 0)}</h3>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <Activity size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Remaining Balance</p>
              <h3 className={`text-2xl font-heading font-bold ${(report?.budgetRemaining || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatINR(report?.budgetRemaining || 0)}
              </h3>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-4">
                <PieChartIcon size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Budget Utilized</p>
              <h3 className="text-2xl font-heading font-bold text-text">
                {(report?.budgetUsedPercentage || 0).toFixed(1)}%
              </h3>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-3 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${(report?.budgetUsedPercentage || 0) > 90 ? 'bg-red-500' : 'bg-primary'}`}
                  style={{ width: `${Math.min(report?.budgetUsedPercentage || 0, 100)}%` }}
                />
              </div>
            </motion.div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown Pie Chart */}
            <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm space-y-4">
              <h3 className="text-xl font-heading font-bold text-text flex items-center gap-2">
                <PieChartIcon className="text-primary" size={20} /> Category Expense Breakdown
              </h3>
              
              {categoryData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val) => formatINR(val)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-text-secondary text-sm">
                  No expense category data recorded yet for this selection.
                </div>
              )}
            </div>

            {/* Monthly Expense Bar Chart */}
            <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm space-y-4">
              <h3 className="text-xl font-heading font-bold text-text flex items-center gap-2">
                <BarChart3 className="text-primary" size={20} /> Monthly Spending Trends
              </h3>

              {monthlyData.length > 0 ? (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" stroke="#888888" fontSize={12} />
                      <YAxis stroke="#888888" fontSize={12} tickFormatter={(v) => `₹${v}`} />
                      <RechartsTooltip formatter={(val) => formatINR(val)} />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center text-text-secondary text-sm">
                  No monthly spending history available for this selection.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Admin Analytics Dashboard */
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Users</p>
              <h3 className="text-2xl font-heading font-bold text-text">{adminStats?.totalUsers || 0}</h3>
            </div>

            <div className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-4">
                <Compass size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Trips Created</p>
              <h3 className="text-2xl font-heading font-bold text-text">{adminStats?.totalTrips || 0}</h3>
            </div>

            <div className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Total Destinations</p>
              <h3 className="text-2xl font-heading font-bold text-text">{adminStats?.totalDestinations || 0}</h3>
            </div>

            <div className="bg-white p-6 rounded-[20px] border border-border shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Wallet size={24} />
              </div>
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1">Platform Spending Tracked</p>
              <h3 className="text-2xl font-heading font-bold text-text">{formatINR(adminStats?.totalPlatformExpensesAmount || 0)}</h3>
            </div>
          </div>

          {/* Top Destinations Table */}
          <div className="bg-white p-6 rounded-[24px] border border-border shadow-sm space-y-4">
            <h3 className="text-xl font-heading font-bold text-text flex items-center gap-2">
              <MapPin className="text-primary" size={20} /> Popular Destinations Breakdown
            </h3>

            {topDestinationsData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-border text-text-secondary text-xs uppercase tracking-wider">
                      <th className="py-3 px-4">Destination</th>
                      <th className="py-3 px-4">Total Planned Trips</th>
                      <th className="py-3 px-4">Popularity Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-medium">
                    {topDestinationsData.map((dest, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="py-3.5 px-4 font-bold text-text">{dest.name}</td>
                        <td className="py-3.5 px-4 text-text-secondary">{dest.count} Trips</td>
                        <td className="py-3.5 px-4">
                          <div className="w-full bg-gray-100 rounded-full h-2 max-w-xs overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full"
                              style={{ width: `${Math.min((dest.count / (adminStats?.totalTrips || 1)) * 100, 100)}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-text-secondary text-sm">No destination activity recorded yet.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
