import { useEffect, useState } from 'react';
import {
  Title,
  Card,
  FlexBox,
  Text,
  BusyIndicator,
} from '@ui5/webcomponents-react';
import { salesAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Mock data for demo (replace with API call when backend is ready)
      const mockStats = {
        total_sales: 15234.50,
        total_tax: 1523.45,
        total_transactions: 87,
        low_stock_products: [
          { id: 1, name: 'Coca Cola 500ml', category: 'Beverages', stock_qty: 5, price: 2.50 },
          { id: 2, name: 'Lays Chips', category: 'Snacks', stock_qty: 8, price: 1.99 },
          { id: 3, name: 'Bread Loaf', category: 'Bakery', stock_qty: 3, price: 3.50 },
          { id: 4, name: 'Milk 1L', category: 'Dairy', stock_qty: 7, price: 4.25 },
          { id: 5, name: 'Eggs (12 pack)', category: 'Dairy', stock_qty: 4, price: 5.99 },
        ]
      };
      setStats(mockStats);
      // const response = await salesAPI.getDashboard();
      // setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <BusyIndicator active />
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div style={{ marginBottom: '40px' }}>
        <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>Dashboard</Title>
        <Text style={{ color: '#666666', fontSize: '14px' }}>Overview of your store performance</Text>
      </div>

      <FlexBox
        justifyContent="Start"
        alignItems="Stretch"
        wrap="Wrap"
        style={{ gap: '24px', marginBottom: '40px' }}
      >
        <div className="stat-card">
          <div className="stat-content">
            <Text className="stat-label">Total Sales Today</Text>
            <Title level="H3" className="stat-value">
              Rs. {stats?.total_sales?.toFixed(2) || '0.00'}
            </Title>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <Text className="stat-label">Total Tax</Text>
            <Title level="H3" className="stat-value">
              Rs. {stats?.total_tax?.toFixed(2) || '0.00'}
            </Title>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-content">
            <Text className="stat-label">Total Transactions</Text>
            <Title level="H3" className="stat-value">
              {stats?.total_transactions || 0}
            </Title>
          </div>
        </div>
      </FlexBox>

      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
      }}>
        <Title level="H4" style={{ fontSize: '18px', fontWeight: '600', color: '#1a1a1a', marginBottom: '24px' }}>Low Stock Alert</Title>
        {stats?.low_stock_products?.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
                  <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stock Quantity</th>
                  <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</th>
                </tr>
              </thead>
              <tbody>
                {stats.low_stock_products.map((product, index) => (
                  <tr key={product.id} style={{ borderBottom: index < stats.low_stock_products.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                    <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{product.name}</td>
                    <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{product.category}</td>
                    <td style={{ padding: '16px', color: product.stock_qty < 5 ? '#dc2626' : '#f59e0b', fontSize: '14px', fontWeight: '700' }}>
                      {product.stock_qty}
                    </td>
                    <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {product.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <Text style={{ color: '#666666' }}>No low stock items</Text>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
