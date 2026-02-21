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
