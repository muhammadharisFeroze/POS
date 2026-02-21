import { Outlet } from 'react-router-dom';
import AppShellBar from './AppShellBar';
import AppSideNavigation from './AppSideNavigation';
import './MainLayout.css';

const MainLayout = () => {
  return (
    <div className="main-layout">
      <AppShellBar />
      <div className="main-content">
        <AppSideNavigation />
        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
