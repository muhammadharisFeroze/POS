import { ShellBar, Avatar } from '@ui5/webcomponents-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import logo from '../assets/Feroze-1888.png';

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
      background: 'linear-gradient(135deg, #0066cc 0%, #0052a3 100%)',
      borderBottom: '1px solid #0052a3',
      padding: '0 20px',
      height: '61px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 2px 4px rgba(0, 102, 204, 0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          height: '44px'
        }} onClick={handleLogoClick}>
          <img 
            src={logo} 
            alt="Feroze 1888 Mills" 
            style={{
              // height: '44px',
              // width: 'auto',
              height: '50px',
              width: '167px',
              objectFit: 'contain',
              transition: 'transform 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          />
        </div>
        <div style={{
          fontSize: '10px',
          fontWeight: '600',
          color: '#ffffff',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          padding: '4px 10px',
          background: 'rgba(255, 255, 255, 0.2)',
          borderRadius: '4px',
          border: '1px solid rgba(255, 255, 255, 0.3)'
        }}>
          {user?.role === 'admin' ? 'Administrator' : 'Cashier'}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ textAlign: 'right', marginRight: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff' }}>{user?.name || 'User'}</div>
          <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.8)' }}>{user?.email}</div>
        </div>
        <button
          onClick={handleProfileClick}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: '#ffffff',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            color: '#0066cc',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#e6f2ff';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = '#ffffff';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {user?.name?.charAt(0) || 'U'}
        </button>
      </div>
    </div>
  );
};

export default AppShellBar;
