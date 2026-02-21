import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './AppSideNavigation.css';

const AppSideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { id: 'discountsetup', label: 'Discount Setup', icon: '🏷️', path: '/discountsetup', adminOnly: true },
    { id: 'products', label: 'Products', icon: '📦', path: '/products', adminOnly: true },
    { id: 'importproducts', label: 'Import Products', icon: '📥', path: '/importproducts', adminOnly: true },
    { id: 'pos', label: 'POS', icon: '🛒', path: '/pos' },
    { id: 'sales', label: 'Sales', icon: '💰', path: '/sales' },
    { id: 'reports', label: 'Reports', icon: '📈', path: '/reports' },
    { id: 'users', label: 'Users', icon: '👥', path: '/users', adminOnly: true },
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => {
          // Skip admin-only items for non-admin users
          if (item.adminOnly && user?.role !== 'admin') {
            return null;
          }

          const isActive = location.pathname === item.path;
          return (
            <div
              key={item.id}
              className={`menu-item ${isActive ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppSideNavigation;
