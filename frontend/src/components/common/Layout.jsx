import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
  );
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileOpen((prev) => !prev);
    } else {
      setIsCollapsed((prev) => !prev);
    }
  };

  const handleQuickAdd = () => {
    navigate('/expenses?action=add');
  };

  return (
    <div className="app-layout">
      {/* Sidebar navigation */}
      <Sidebar
        isOpen={mobileOpen}
        isCollapsed={isCollapsed}
        onClose={() => setMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className={`main-content ${isCollapsed && !isMobile ? 'sidebar-collapsed' : ''}`}>
        <Navbar
          onToggleSidebar={handleToggleSidebar}
          onQuickAddExpense={handleQuickAdd}
        />

        <main style={{ flex: 1, padding: '2rem 1.5rem', maxWidth: '1440px', width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
