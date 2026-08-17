import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, MessageSquare, Sun, ChevronDown, Menu, LogOut, Settings, User } from 'lucide-react';
import { notificationService } from '../../services/notificationService';
import AIAssistant from '../ai/AIAssistant';

import Breadcrumbs from '../ui/Breadcrumbs';

export default function DashboardNavbar({ isCollapsed, setIsCollapsed, setIsMobileOpen }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize theme
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('dark');
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 10000); // Check every 10 seconds for real-time alerts
    const handleNotificationEvent = () => fetchUnreadCount();
    window.addEventListener('notificationUpdate', handleNotificationEvent);

    return () => {
      clearInterval(interval);
      window.removeEventListener('notificationUpdate', handleNotificationEvent);
    };
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  return (
    <header 
      className="sticky top-0 z-40 transition-all duration-300 bg-background/80 backdrop-blur-xl border-b border-border/50 w-full"
    >
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20">
        
        {/* Left: Mobile Menu & Breadcrumbs */}
        <div className="flex items-center gap-4">
          {/* Desktop Toggle */}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 -ml-2 text-text-secondary hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
            aria-label="Toggle Sidebar"
          >
            <Menu size={24} />
          </button>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="lg:hidden p-2 -ml-2 text-text-secondary hover:text-primary rounded-lg hover:bg-primary/10 transition-colors"
            aria-label="Open Mobile Menu"
          >
            <Menu size={24} />
          </button>

          <div className="hidden sm:block mt-6">
            <Breadcrumbs />
          </div>
        </div>

        {/* Right: Search & Actions */}
        <div className="flex items-center gap-3 sm:gap-6">
          


          <div className="flex items-center gap-2">
            <button 
              onClick={() => navigate('/dashboard/notifications')}
              className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors relative" 
              aria-label="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <button 
              onClick={() => setIsAiAssistantOpen(true)}
              className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" 
              aria-label="AI Travel Assistant"
              title="AI Travel Assistant"
            >
              <MessageSquare size={20} />
            </button>
            <button 
              className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-full transition-colors" 
              aria-label="Toggle Theme"
              onClick={() => {
                const isDark = document.documentElement.classList.toggle('dark');
                localStorage.setItem('theme', isDark ? 'dark' : 'light');
              }}
            >
              <Sun size={20} />
            </button>
          </div>

          <div className="h-8 w-px bg-border mx-1"></div>

          {/* Profile Dropdown */}
          <div className="relative">
            {(() => {
              const userStr = localStorage.getItem('tripnest_user');
              const user = userStr ? JSON.parse(userStr) : null;
              const username = user ? (user.username || user.email) : 'Sarah Jenkins';
              return (
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer focus:outline-none" 
                  aria-label="User Profile Menu"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-secondary p-0.5">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop" 
                      alt="User Avatar" 
                      className="w-full h-full rounded-full object-cover border-2 border-white"
                    />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-text leading-tight">{username}</p>
                    <p className="text-xs text-text-secondary">{user ? 'Traveler' : 'Pro Member'}</p>
                  </div>
                  <ChevronDown size={16} className={`text-text-muted hidden sm:block transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>
              );
            })()}

            <AnimatePresence>
              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  ></div>
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-3 w-56 bg-surface border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                  >
                    <div className="py-2">
                      <button onClick={() => { setIsProfileOpen(false); navigate('/dashboard/profile'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors">
                        <User size={16} /> Profile
                      </button>
                      <button onClick={() => { setIsProfileOpen(false); navigate('/dashboard/settings'); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-primary/5 transition-colors">
                        <Settings size={16} /> Settings
                      </button>
                      <div className="h-px bg-border my-2"></div>
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          sessionStorage.removeItem('tripnest_token');
                          sessionStorage.removeItem('tripnest_user');
                          localStorage.removeItem('tripnest_token');
                          localStorage.removeItem('tripnest_user');
                          navigate('/login');
                        }} 
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={16} /> Log out
                      </button>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

        </div>
      </div>
      
      {/* AI Assistant Panel */}
      <AIAssistant 
        isOpen={isAiAssistantOpen} 
        onClose={() => setIsAiAssistantOpen(false)} 
      />
    </header>
  );
}
