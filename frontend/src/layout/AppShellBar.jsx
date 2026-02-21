import { ShellBar, Avatar } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const AppShellBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleLogoClick = () => {
    navigate('/dashboard');
  };

  const handleProfileClick = () => {
    handleLogout();
  };

  return (
    <div style={{
      background: '#ffffff',
      borderBottom: '1px solid #e0e0e0',
      padding: '0 32px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#2563eb',
          cursor: 'pointer',
          letterSpacing: '-0.5px'
        }} onClick={handleLogoClick}>
          POS System
        </div>
        <div style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#666666',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '4px 12px',
          background: '#f0f9ff',
          borderRadius: '4px',
          border: '1px solid #bfdbfe'
        }}>
          {user?.role === 'admin' ? 'Administrator' : 'Cashier'}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ textAlign: 'right', marginRight: '12px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a1a1a' }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '12px', color: '#666666' }}>{user?.email}</div>
        </div>
        <button
          onClick={handleProfileClick}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#2563eb',
            border: 'none',
            color: '#ffffff',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseOut={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          {user?.name?.charAt(0) || 'U'}
        </button>
      </div>
    </div>
  );
};

export default AppShellBar;
