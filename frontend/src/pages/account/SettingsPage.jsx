import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Bell, Lock, Globe, Moon, Save, Loader2, CheckCircle, X } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useToast } from '../../components/ui/ToastProvider';
import { userService } from '../../services/userService';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { addToast } = useToast();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  
  const [settings, setSettings] = useState({
    currency: 'USD',
    language: 'en',
    timezone: 'UTC',
    emailNotifications: true,
    pushNotifications: true,
    theme: 'light'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await userService.getSettings();
      if (res) {
        setSettings({
          currency: res.currency || 'USD',
          language: res.language || 'en',
          timezone: res.timezone || 'UTC',
          emailNotifications: res.emailNotifications !== false,
          pushNotifications: res.pushNotifications !== false,
          theme: res.theme || 'light'
        });
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await userService.updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Apply theme to document if changed
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark');
      }
    } catch (error) {
      console.error("Failed to save settings:", error);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      addToast('New passwords do not match', 'error');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      addToast('New password must be at least 6 characters', 'error');
      return;
    }
    try {
      setIsUpdatingPassword(true);
      await userService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      addToast('Password updated successfully', 'success');
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      addToast(error.message || 'Failed to update password', 'error');
    } finally {
      setIsUpdatingPassword(false);
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
      className="max-w-3xl mx-auto pb-12"
    >
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-3">
          <Settings className="text-brand-500" />
          Account Settings
        </h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your app preferences and notification settings.</p>
      </div>

      <div className="bg-surface rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit}>
          
          {/* Preferences Section */}
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Globe size={18} className="text-brand-500" />
              Regional & Display Preferences
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Display Language
                </label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                >
                  <option value="en">English (US)</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                >
                  <option value="UTC">UTC (Coordinated Universal Time)</option>
                  <option value="EST">EST (Eastern Standard Time)</option>
                  <option value="PST">PST (Pacific Standard Time)</option>
                  <option value="IST">IST (Indian Standard Time)</option>
                </select>
              </div>
              

            </div>
          </div>

          {/* Notifications Section */}
          <div className="p-6 md:p-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Bell size={18} className="text-brand-500" />
              Notifications
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-start gap-4 cursor-pointer p-4 bg-surface border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-300 transition-colors">
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">Email Notifications</span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1">Receive itinerary updates, booking confirmations, and group invites via email.</span>
                </div>
              </label>

              <label className="flex items-start gap-4 cursor-pointer p-4 bg-surface border border-slate-200 dark:border-slate-700 rounded-xl hover:border-brand-300 transition-colors">
                <div className="flex items-center h-5 mt-1">
                  <input
                    type="checkbox"
                    name="pushNotifications"
                    checked={settings.pushNotifications}
                    onChange={handleChange}
                    className="w-5 h-5 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                  />
                </div>
                <div>
                  <span className="block text-sm font-medium text-slate-900 dark:text-white">Push Notifications</span>
                  <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1">Get real-time alerts for travel delays, expense splits, and messages.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Privacy & Security (Static for now) */}
          <div className="p-6 md:p-8">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
              <Lock size={18} className="text-brand-500" />
              Privacy & Security
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div>
                <span className="block text-sm font-medium text-slate-900 dark:text-white">Password</span>
                <span className="block text-sm text-slate-500 dark:text-slate-400 mt-1">Last changed 3 months ago</span>
              </div>
              <Button 
                variant="outline" 
                type="button" 
                size="sm"
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Update
              </Button>
            </div>
          </div>

          <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end">
            <div className="flex items-center gap-4">
              {success && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-1.5 text-green-600 dark:text-green-400 text-sm font-medium"
                >
                  <CheckCircle size={16} />
                  Settings saved
                </motion.div>
              )}
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="min-w-[120px]"
              >
                {saving ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>

        </form>
      </div>

      {/* Password Update Modal */}
      <AnimatePresence>
        {isPasswordModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface p-6 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Update Password</h2>
                <button onClick={() => setIsPasswordModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Current Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-3 mt-6 pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsPasswordModalOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="primary" disabled={isUpdatingPassword}>
                    {isUpdatingPassword ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
