import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import AppShellBar from './AppShellBar';
import AppSideNavigation from './AppSideNavigation';
import './MainLayout.css';

const MainLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', isCollapsed);
  }, [isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="main-layout">
      <AppShellBar />
      <div className="main-content">
        <AppSideNavigation isCollapsed={isCollapsed} onToggle={toggleSidebar} />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
