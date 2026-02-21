import { SideNavigation, SideNavigationItem } from '@ui5/webcomponents-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '@ui5/webcomponents-icons/dist/home.js';
import '@ui5/webcomponents-icons/dist/product.js';
import '@ui5/webcomponents-icons/dist/cart.js';
import '@ui5/webcomponents-icons/dist/receipt.js';
import '@ui5/webcomponents-icons/dist/bar-chart.js';
import '@ui5/webcomponents-icons/dist/group.js';

const AppSideNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  const handleItemClick = (e) => {
    const path = e.detail.item.dataset.path;
    if (path) {
      navigate(path);
    }
  };

  return (
    <SideNavigation
      onSelectionChange={handleItemClick}
      style={{
        height: 'calc(100vh - 64px)',
        width: '240px',
        borderRight: '1px solid #e0e0e0',
        background: '#ffffff',
      }}
    >
      <SideNavigationItem
        text="Dashboard"
        icon="home"
        data-path="/dashboard"
        selected={location.pathname === '/dashboard'}
      />
      
      <SideNavigationItem
        text="POS"
        icon="cart"
        data-path="/pos"
        selected={location.pathname === '/pos'}
      />
      
      {user?.role === 'admin' && (
        <SideNavigationItem
          text="Products"
          icon="product"
          data-path="/products"
          selected={location.pathname === '/products'}
        />
      )}
      
      <SideNavigationItem
        text="Sales"
        icon="receipt"
        data-path="/sales"
        selected={location.pathname === '/sales'}
      />
      
      <SideNavigationItem
        text="Reports"
        icon="bar-chart"
        data-path="/reports"
        selected={location.pathname === '/reports'}
      />
      
      {user?.role === 'admin' && (
        <SideNavigationItem
          text="Users"
          icon="group"
          data-path="/users"
          selected={location.pathname === '/users'}
        />
      )}
    </SideNavigation>
  );
};

export default AppSideNavigation;
