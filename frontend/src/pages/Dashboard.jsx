import { useEffect, useState } from 'react';
import {
  Title,
  Card,
  FlexBox,
  Text,
  BusyIndicator,
} from '@ui5/webcomponents-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { salesAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [userWiseData, setUserWiseData] = useState([]);
  const [userWiseDailyData, setUserWiseDailyData] = useState([]);
  const [userList, setUserList] = useState([]);
  const [hiddenUsers, setHiddenUsers] = useState({});
  const [productWiseData, setProductWiseData] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#0066cc', '#00b0ff', '#00c853', '#ff6f00', '#d50000', '#aa00ff', '#ffab00', '#00bfa5'];

  useEffect(() => {
    fetchAllDashboardData();
  }, []);

  const fetchAllDashboardData = async () => {
    try {
      // Get today's date and last 30 days for other reports
      const today = new Date();
      const last30Days = new Date(today);
      last30Days.setDate(last30Days.getDate() - 29);
      // Get last 7 days for user-wise daily comparison
      const last7Days = new Date(today);
      last7Days.setDate(last7Days.getDate() - 6);

      const formatDate = (date) => date.toISOString().split('T')[0];

      // Fetch all data in parallel
      const [dashboardRes, dailyRes, userWiseRes, userWiseDailyRes, productWiseRes] = await Promise.all([
        salesAPI.getDashboard(),
        salesAPI.getDailyReport({ start_date: formatDate(last30Days), end_date: formatDate(today) }),
        salesAPI.getUserWiseReport({ start_date: formatDate(last30Days), end_date: formatDate(today) }),
        salesAPI.getUserWiseDailyChart({ start_date: formatDate(last7Days), end_date: formatDate(today) }),
        salesAPI.getProductWiseReport({ start_date: formatDate(last30Days), end_date: formatDate(today) }),
      ]);
      
      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.data);
      }

      if (dailyRes.data.success) {
        const chartData = dailyRes.data.data.map(item => ({
          date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          sales: parseFloat(item.total || 0),
          transactions: parseInt(item.transactions || 0),
        }));
        setDailySalesData(chartData.reverse());
      }

      if (userWiseRes.data.success) {
        const userData = userWiseRes.data.data.map(item => ({
          name: item.user_name,
          transactions: parseInt(item.transaction_count || 0),
          sales: parseFloat(item.total_sales || 0),
          role: item.role,
        }));
        setUserWiseData(userData);
      }

      if (userWiseDailyRes.data.success) {
        setUserWiseDailyData(userWiseDailyRes.data.data);
        // Extract user names from the first data row (keys except 'date')
        if (userWiseDailyRes.data.data.length > 0) {
          const firstRow = userWiseDailyRes.data.data[0];
          const users = Object.keys(firstRow).filter(key => key !== 'date');
          setUserList(users);
        }
      }

      if (productWiseRes.data.success) {
        setProductWiseData(productWiseRes.data.data.slice(0, 10));
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  const highestProduct = productWiseData[0];

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <Title level="H2" style={{ fontSize: '32px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          📊 Dashboard
        </Title>
        <Text style={{ color: '#666666', fontSize: '14px' }}>Welcome back! Here's what's happening with your store today.</Text>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card-modern primary">
          <div className="stat-icon">💰</div>
          <div className="stat-details">
            <Text className="stat-label-modern">Total Sales</Text>
            <Title level="H3" className="stat-value-modern">
              Rs. {parseFloat(stats?.total_sales || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Title>
            <Text className="stat-subtitle">All time revenue</Text>
          </div>
        </div>

        <div className="stat-card-modern success">
          <div className="stat-icon">📅</div>
          <div className="stat-details">
            <Text className="stat-label-modern">Today's Sales</Text>
            <Title level="H3" className="stat-value-modern">
              Rs. {parseFloat(stats?.today_sales || 0).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Title>
            <Text className="stat-subtitle">{stats?.total_transactions || 0} transactions</Text>
          </div>
        </div>

        <div className="stat-card-modern warning">
          <div className="stat-icon">📦</div>
          <div className="stat-details">
            <Text className="stat-label-modern">Top Product</Text>
            <Title level="H4" className="stat-value-modern" style={{ fontSize: '18px' }}>
              {highestProduct?.product || 'N/A'}
            </Title>
            <Text className="stat-subtitle">
              {highestProduct ? `${highestProduct.quantity} units sold` : 'No data'}
            </Text>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Daily Sales Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <Title level="H4" className="chart-title">📈 Daily Sales Trend</Title>
              <Text className="chart-subtitle">Last 30 days performance</Text>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={dailySalesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#0066cc" 
                  strokeWidth={3} 
                  dot={{ fill: '#0066cc', r: 5 }} 
                  activeDot={{ r: 7 }} 
                  name="Sales (Rs)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User-wise Transactions Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <div>
              <Title level="H4" className="chart-title">👥 User Performance</Title>
              <Text className="chart-subtitle">Transactions by user (Last 30 days)</Text>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={userWiseData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#666" style={{ fontSize: '12px' }} />
                <YAxis stroke="#666" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }} 
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="transactions" fill="#00c853" name="Transactions" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* User-wise Daily Sales Comparison Chart */}
      <div className="chart-card" style={{ marginTop: '24px' }}>
        <div className="chart-header">
          <div>
            <Title level="H4" className="chart-title">📊 Daily Sales by User</Title>
            <Text className="chart-subtitle">User-wise sales comparison (Last 7 days)</Text>
          </div>
        </div>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={userWiseDailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" stroke="#666" style={{ fontSize: '11px' }} />
              <YAxis stroke="#666" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e0e0e0', 
                  borderRadius: '8px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }} 
                formatter={(value) => `Rs. ${parseFloat(value).toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              />
              <Legend 
                wrapperStyle={{ fontSize: '12px', cursor: 'pointer' }} 
                onClick={(e) => {
                  if (e && e.value) {
                    setHiddenUsers(prev => ({
                      ...prev,
                      [e.value]: !prev[e.value]
                    }));
                  }
                }}
              />
              {userList.map((userName, index) => (
                <Bar 
                  key={userName}
                  dataKey={userName} 
                  fill={COLORS[index % COLORS.length]} 
                  name={userName}
                  radius={[4, 4, 0, 0]}
                  hide={hiddenUsers[userName] || false}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* User-wise Sales Table */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <Title level="H4" className="table-title">💼 User-wise Sales Report</Title>
            <Text className="table-subtitle">Sales performance by team member (Last 30 days)</Text>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Role</th>
                <th>Transactions</th>
                <th>Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {userWiseData.length > 0 ? (
                userWiseData.map((user, index) => (
                  <tr key={index}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{user.name.charAt(0)}</div>
                        <span className="user-name">{user.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td className="number-cell">{user.transactions}</td>
                    <td className="amount-cell">Rs. {user.sales.toLocaleString('en-PK', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
                    No user data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="table-card">
        <div className="table-header">
          <div>
            <Title level="H4" className="table-title">⚠️ Low Stock Alert</Title>
            <Text className="table-subtitle">Products running low on inventory</Text>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="modern-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock Quantity</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {stats?.low_stock_products?.length > 0 ? (
                stats.low_stock_products.map((product, index) => (
                  <tr key={product.id}>
                    <td className="product-name">{product.name}</td>
                    <td>{product.category}</td>
                    <td>
                      <span className={`stock-badge ${product.stock_qty < 5 ? 'critical' : 'warning'}`}>
                        {product.stock_qty} units
                      </span>
                    </td>
                    <td className="amount-cell">Rs. {parseFloat(product.price).toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#999' }}>
                    ✅ All products are well stocked
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
