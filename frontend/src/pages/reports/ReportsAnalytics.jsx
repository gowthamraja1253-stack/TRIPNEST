import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Activity, Download, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import { analyticsService } from '../../services/analyticsService';
import { formatCurrency } from '../../utils/formatters';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function ReportsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getUserGlobalAnalytics();
      setReport(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !report) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-brand-600" />
      </div>
    );
  }

  // Format category data for PieChart
  const categoryData = Object.entries(report.expensesByCategory || {})
    .map(([name, value]) => ({ name: name.replace('_', ' '), value }))
    .sort((a, b) => b.value - a.value);

  // Format monthly data for BarChart
  const monthlyData = Object.entries(report.expensesByMonth || {})
    .map(([name, value]) => ({ name, amount: value }))
    // Simple sort based on year/month could be complex here, assuming backend order or simple strings
    .reverse(); 

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">Reports & Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">
            Gain insights into your travel spending and habits.
          </p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={18} />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center mb-4 text-brand-600 dark:text-brand-400">
            <TrendingUp size={24} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Spent</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(report.totalSpent || 0)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400">
            <Activity size={24} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Total Budgets</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{formatCurrency(report.totalBudget || 0)}</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-green-50 dark:bg-green-900/20 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
            <PieChartIcon size={24} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Budget Utilized</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
            {report.budgetUsedPercentage ? report.budgetUsedPercentage.toFixed(1) : 0}%
          </h3>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mt-3">
            <div 
              className={`h-1.5 rounded-full ${report.budgetUsedPercentage > 90 ? 'bg-red-500' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(report.budgetUsedPercentage || 0, 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-4 text-amber-600 dark:text-amber-400">
            <BarChart3 size={24} />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">Top Category</p>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
            {categoryData.length > 0 ? categoryData[0].name.toLowerCase() : 'N/A'}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending by Category</h3>
          {categoryData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
              No expense data available
            </div>
          )}
        </div>

        {/* Monthly Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Spending Trends</h3>
          {monthlyData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-slate-500 dark:text-slate-400">
              No trend data available
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
