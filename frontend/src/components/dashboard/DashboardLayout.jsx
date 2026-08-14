import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import DashboardNavbar from './DashboardNavbar';
import RightSidebar from './RightSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorBoundary from '../ui/ErrorBoundary';

export default function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Scroll window to top whenever route path changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Auto-collapse sidebar on smaller desktop screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1280 && window.innerWidth >= 1024) {
        setIsSidebarCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        setIsSidebarCollapsed(false);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Left Sidebar ── */}
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed}
        isMobileOpen={isMobileMenuOpen}
        setIsMobileOpen={setIsMobileMenuOpen}
      />

      {/* ── Main Content Area ── */}
      <div 
        className={`flex-1 flex flex-col min-h-screen min-w-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:ml-[88px]' : 'lg:ml-[280px]'}`}
      >
        <DashboardNavbar 
          isCollapsed={isSidebarCollapsed}
          setIsCollapsed={setIsSidebarCollapsed}
          setIsMobileOpen={setIsMobileMenuOpen} 
        />
        
        <div className="flex flex-1 overflow-hidden min-w-0">
          {/* Main Router Outlet */}
          <main className="flex-1 min-w-0 overflow-y-auto p-4 sm:p-6 lg:p-8 no-scrollbar">
            <ErrorBoundary>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="max-w-7xl mx-auto h-full"
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </ErrorBoundary>
          </main>

          {/* ── Right Sidebar (Desktop only) ── */}
          {!['/dashboard/documents', '/dashboard/itinerary', '/dashboard/budget', '/dashboard/destinations'].some(path => location.pathname.startsWith(path)) && <RightSidebar />}
        </div>
      </div>
    </div>
  );
}
