import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Title,
  Label,
  Input,
  Button,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { useAuthStore } from '../store/authStore';
import { authAPI } from '../services/api';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Login attempt:', email, password);

    try {
      // Mock authentication for demo (remove when backend is ready)
      if (email === 'admin@pos.com' && password === 'admin123') {
        const mockUser = {
          id: 1,
          name: 'Admin User',
          email: 'admin@pos.com',
          role: 'admin'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        console.log('Login successful, setting auth...');
        setAuth(mockUser, mockToken);
        console.log('Navigating to dashboard...');
        navigate('/dashboard');
      } else {
        setError('Invalid credentials. Use: admin@pos.com / admin123');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <Title level="H2">POS System</Title>
          <p style={{ color: '#6a6d70', marginTop: '8px' }}>Sign in to continue</p>
        </div>

        {error && (
          <MessageStrip
            design="Negative"
            hideCloseButton
            style={{ marginBottom: '16px' }}
          >
            {error}
          </MessageStrip>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-field">
            <Label required>Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-field">
            <Label required>Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{ width: '100%' }}
            />
          </div>

          <Button
            design="Emphasized"
            onClick={handleSubmit}
            disabled={loading}
            style={{ width: '100%', marginTop: '16px' }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="login-footer">
          <p>Default credentials: admin@pos.com / admin123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
