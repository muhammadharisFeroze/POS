import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input } from '@ui5/webcomponents-react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    setError('');
    setLoading(true);

    try {
      // Call real backend API
      const response = await authAPI.login(email, password);
      
      if (response.data) {
        const { user, token } = response.data;
        setAuth(user, token);
        navigate('/dashboard');
      } else {
        setError('Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Form submission is handled by form onSubmit, no need for keyPress handler

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="brand-section">
          <div className="brand-logo">
            <div className="logo-icon">🏭</div>
          </div>
          <h1 className="brand-name">Feroze 1888 Mills</h1>
          <p className="brand-tagline">Point of Sale System</p>
          <p className="brand-subtitle">Fair Price Shop Management</p>
          <div className="brand-features">
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Fast & Reliable</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Secure Transactions</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">✓</span>
              <span>Real-time Inventory</span>
            </div>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="login-card">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Sign in to access your account</p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error}
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@pos.com"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="form-input"
              />
            </div>

            <Button
              design="Emphasized"
              disabled={loading}
              className="login-button"
              type="submit"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="login-footer">
            <p className="footer-text">© 2026 Feroze 1888 Mills. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
