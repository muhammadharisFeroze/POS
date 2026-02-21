import { useState } from 'react';
import {
  Title,
  Button,
  Text,
  Input,
  Label,
  Select,
  Option,
} from '@ui5/webcomponents-react';
import './Reports.css';

const Reports = () => {
  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState('2026-02-01');
  const [endDate, setEndDate] = useState('2026-02-21');

  // Mock report data
  const dailySalesData = [
    { date: '2026-02-21', transactions: 87, subtotal: 15234.50, tax: 1523.45, total: 16757.95 },
    { date: '2026-02-20', transactions: 72, subtotal: 12890.00, tax: 1289.00, total: 14179.00 },
    { date: '2026-02-19', transactions: 95, subtotal: 18450.00, tax: 1845.00, total: 20295.00 },
  ];

  const productWiseData = [
    { product: 'Coca Cola 500ml', category: 'Beverages', quantity: 145, revenue: 21750 },
    { product: 'Lays Chips', category: 'Snacks', quantity: 198, revenue: 23760 },
    { product: 'Bread Loaf', category: 'Bakery', quantity: 89, revenue: 16020 },
    { product: 'Milk 1L', category: 'Dairy', quantity: 134, revenue: 37520 },
    { product: 'Eggs (12 pack)', category: 'Dairy', quantity: 67, revenue: 28140 },
  ];

  const taxReportData = [
    { date: '2026-02-21', subtotal: 15234.50, tax: 1523.45, total: 16757.95 },
    { date: '2026-02-20', subtotal: 12890.00, tax: 1289.00, total: 14179.00 },
    { date: '2026-02-19', subtotal: 18450.00, tax: 1845.00, total: 20295.00 },
  ];

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
          {dailySalesData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < dailySalesData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.date}</td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.transactions}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {row.subtotal.toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {row.tax.toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {row.total.toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
            <td style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
            <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
              {dailySalesData.reduce((sum, row) => sum + row.transactions, 0)}
            </td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
              Rs. {dailySalesData.reduce((sum, row) => sum + row.subtotal, 0).toFixed(2)}
            </td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
              Rs. {dailySalesData.reduce((sum, row) => sum + row.tax, 0).toFixed(2)}
            </td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
              Rs. {dailySalesData.reduce((sum, row) => sum + row.total, 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
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
          {productWiseData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < productWiseData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.product}</td>
              <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{row.category}</td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.quantity}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {row.revenue.toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
            <td colSpan="2" style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
            <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
              {productWiseData.reduce((sum, row) => sum + row.quantity, 0)}
            </td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#16a34a' }}>
              Rs. {productWiseData.reduce((sum, row) => sum + row.revenue, 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
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
          {taxReportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < taxReportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.date}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {row.subtotal.toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {row.tax.toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {row.total.toFixed(2)}</td>
            </tr>
          ))}
          <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
            <td style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
              Rs. {taxReportData.reduce((sum, row) => sum + row.subtotal, 0).toFixed(2)}
            </td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#16a34a' }}>
              Rs. {taxReportData.reduce((sum, row) => sum + row.tax, 0).toFixed(2)}
            </td>
            <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
              Rs. {taxReportData.reduce((sum, row) => sum + row.total, 0).toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
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
