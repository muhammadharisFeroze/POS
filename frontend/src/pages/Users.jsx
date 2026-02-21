import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Text,
  Dialog,
  Label,
  Input,
  Select,
  Option,
  MessageStrip,
  BusyIndicator,
} from '@ui5/webcomponents-react';
import { useAuthStore } from '../store/authStore';
import { userAPI } from '../services/api';
import './Users.css';

const Users = () => {
  const { user: currentUser } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'cashier'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getAll();
      
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setMessage({ type: 'error', text: 'Failed to load users' });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = () => {
    setEditMode(false);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'cashier'
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.password) {
      setMessage({ type: 'error', text: 'All fields are required' });
      return;
    }

    userAPI.create(formData)
      .then((response) => {
        if (response.data.success) {
          setMessage({ type: 'success', text: 'User created successfully!' });
          handleCloseDialog();
          fetchUsers();
          setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        }
      })
      .catch((error) => {
        console.error('Create user error:', error);
        setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to create user' });
      });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      userAPI.delete(id)
        .then((response) => {
          if (response.data.success) {
            setMessage({ type: 'success', text: 'User deleted successfully!' });
            fetchUsers();
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
          }
        })
        .catch((error) => {
          console.error('Delete user error:', error);
          setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to delete user' });
        });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <BusyIndicator active />
      </div>
    );
  }

  // Check if current user is admin
  if (currentUser?.role !== 'admin') {
    return (
      <div className="users-page">
        <div style={{ 
          padding: '40px', 
          textAlign: 'center',
          background: '#fff',
          borderRadius: '12px',
          border: '1px solid #e0e0e0'
        }}>
          <Text style={{ fontSize: '16px', color: '#dc2626', fontWeight: '600' }}>
            Access Denied
          </Text>
          <Text style={{ fontSize: '14px', color: '#666666', marginTop: '8px' }}>
            You don't have permission to access this page.
          </Text>
        </div>
      </div>
    );
  }

  return (
    <div className="users-page">
      <div style={{ marginBottom: '32px' }}>
        <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          User Management
        </Title>
        <Text style={{ color: '#666666', fontSize: '14px' }}>Manage system users and permissions</Text>
      </div>

      {message.text && (
        <MessageStrip
          design={message.type === 'success' ? 'Positive' : 'Negative'}
          hideCloseButton
          style={{ marginBottom: '24px' }}
        >
          {message.text}
        </MessageStrip>
      )}

      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
        <Button
          design="Emphasized"
          onClick={handleOpenDialog}
          style={{ background: '#2563eb', minWidth: '140px' }}
        >
          + Add User
        </Button>
      </div>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Name</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Created</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.id} style={{ borderBottom: index < users.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{user.name}</td>
                  <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{user.email}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: user.role === 'admin' ? '#dbeafe' : '#dcfce7',
                      color: user.role === 'admin' ? '#2563eb' : '#16a34a',
                      textTransform: 'capitalize'
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{user.created_at}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(user.id)}
                      disabled={user.id === 1}
                      style={{
                        padding: '6px 16px',
                        background: user.id === 1 ? '#f0f0f0' : '#fef2f2',
                        border: user.id === 1 ? '1px solid #e0e0e0' : '1px solid #fecaca',
                        borderRadius: '4px',
                        color: user.id === 1 ? '#999999' : '#dc2626',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: user.id === 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Dialog */}
      <Dialog
        open={dialogOpen}
        onAfterClose={handleCloseDialog}
        headerText="Add New User"
        style={{ width: '500px' }}
      >
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: '16px' }}>
            <Label required>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label required>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label required>Password</Label>
            <Input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Enter password"
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <Label required>Role</Label>
            <Select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.detail.selectedOption.value })}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Option value="admin">Administrator</Option>
              <Option value="cashier">Cashier</Option>
            </Select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button design="Emphasized" onClick={handleSubmit} style={{ background: '#2563eb' }}>
              Create User
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default Users;
