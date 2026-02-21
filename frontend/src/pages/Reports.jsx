import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Text,
  Input,
  Label,
  Select,
  Option,
  BusyIndicator,
  MessageStrip,
} from '@ui5/webcomponents-react';
import { salesAPI } from '../services/api';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-21');
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchReport();
  }, [reportType, startDate, endDate]);

  const fetchReport = async () => {
    if (!startDate || !endDate) return;
    
    setLoading(true);
    try {
      let response;
      const params = { start_date: startDate, end_date: endDate };
      
      if (reportType === 'daily') {
        response = await salesAPI.getDailyReport(params);
      } else if (reportType === 'product') {
        response = await salesAPI.getProductWiseReport(params);
      } else if (reportType === 'tax') {
        response = await salesAPI.getTaxReport(params);
      }
      
      if (response.data.success) {
        setReportData(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch report:', error);
      setMessage({ type: 'error', text: 'Failed to load report' });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    alert('Export to Excel functionality will be implemented with backend integration');
  };

  const renderDailySalesReport = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtotal</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tax</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.date}</td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.transactions}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.subtotal).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.tax).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.total).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.transactions || 0), 0)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.tax || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {reportData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
          No data available for the selected period
        </div>
      )}
    </div>
  );

  const renderProductWiseReport = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Product Name</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty Sold</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.product || row.name}</td>
              <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{row.category}</td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.quantity || row.quantity_sold}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.revenue || row.total_revenue).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td colSpan="2" style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.quantity || row.quantity_sold || 0), 0)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#16a34a' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.revenue || row.total_revenue || 0), 0).toFixed(2)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {reportData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
          No data available for the selected period
        </div>
      )}
    </div>
  );

  const renderTaxReport = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtotal</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tax Collected</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.date}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.subtotal).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.tax || row.tax_collected).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.total).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#16a34a' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.tax || row.tax_collected || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)}
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {reportData.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666666' }}>
          No data available for the selected period
        </div>
      )}
    </div>
  );

  return (
    <div className="reports-page">
      <div style={{ marginBottom: '32px' }}>
        <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          Reports
        </Title>
        <Text style={{ color: '#666666', fontSize: '14px' }}>Generate and view detailed sales reports</Text>
      </div>

      {/* Filters */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '24px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: '16px', alignItems: 'end' }}>
          <div>
            <Label>Report Type</Label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.detail.selectedOption.value)}
              style={{ width: '100%', marginTop: '8px' }}
            >
              <Option value="daily">Daily Sales Report</Option>
              <Option value="product">Product-wise Sales</Option>
              <Option value="tax">Tax Report</Option>
            </Select>
          </div>
          <div>
            <Label>Start Date</Label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          <div>
            <Label>End Date</Label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{ width: '100%', marginTop: '8px' }}
            />
          </div>
          <Button design="Emphasized" onClick={handleExport} style={{ background: '#16a34a' }}>
            Export to Excel
          </Button>
        </div>
      </div>

      {/* Report Content */}
      <div style={{
        background: '#ffffff',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        padding: '32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)'
      }}>
        <Title level="H4" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '24px' }}>
          {reportType === 'daily' && 'Daily Sales Report'}
          {reportType === 'product' && 'Product-wise Sales Report'}
          {reportType === 'tax' && 'Tax Report'}
        </Title>

        {reportType === 'daily' && renderDailySalesReport()}
        {reportType === 'product' && renderProductWiseReport()}
        {reportType === 'tax' && renderTaxReport()}
      </div>
    </div>
  );
};

export default Reports;
