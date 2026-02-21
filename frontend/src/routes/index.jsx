import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useLoading } from '../context/LoadingContext';
import { setLoadingCallbacks } from '../services/api';
import MainLayout from '../layout/MainLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ImportProducts from '../pages/ImportProducts';
import POS from '../pages/POS';
import Sales from '../pages/Sales';
import Reports from '../pages/Reports';
import Users from '../pages/Users';
import DiscountSetup from '../pages/DiscountSetup';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  const { showLoading, hideLoading } = useLoading();

  // Connect API interceptors with loading context
  useEffect(() => {
    setLoadingCallbacks(showLoading, hideLoading);
  }, [showLoading, hideLoading]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pos" element={<POS />} />
          <Route path="products" element={<Products />} />
          <Route path="importproducts" element={<ImportProducts />} />
          <Route path="sales" element={<Sales />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="discountsetup" element={<DiscountSetup />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
