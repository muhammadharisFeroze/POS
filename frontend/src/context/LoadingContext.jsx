import { createContext, useContext, useState } from 'react';
import { BusyIndicator } from '@ui5/webcomponents-react';

const LoadingContext = createContext();

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

export const LoadingProvider = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const showLoading = () => {
    setLoadingCount(prev => prev + 1);
  };

  const hideLoading = () => {
    setLoadingCount(prev => Math.max(0, prev - 1));
  };

  const isLoading = loadingCount > 0;

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading, isLoading }}>
      {children}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            padding: '32px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}>
            <BusyIndicator active size="Large" />
            <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Loading...
            </span>
          </div>
        </div>
      )}
    </LoadingContext.Provider>
  );
};
