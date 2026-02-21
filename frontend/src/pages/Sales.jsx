import { useState, useEffect } from 'react';
import {
  Title,
  Button,
  Text,
  BusyIndicator,
  Dialog,
} from '@ui5/webcomponents-react';
import { salesAPI } from '../services/api';
import './Sales.css';

const Sales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    fetchSales();
  }, []);

  const fetchSales = async () => {
    try {
      const response = await salesAPI.getAll();
      
      if (response.data.sales) {
        setSales(response.data.sales);
      }
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch sales:', error);
      setLoading(false);
    }
  };

  const handleViewInvoice = async (sale) => {
    try {
      // Fetch full sale details with items
      const response = await salesAPI.getById(sale.id);
      
      if (response.data) {
        setSelectedSale(response.data);
        setDialogOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch sale details:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <BusyIndicator active />
      </div>
    );
  }

  return (
    <div className="sales-page">
      <div style={{ marginBottom: '32px' }}>
        <Title level="H2" style={{ fontSize: '28px', fontWeight: '700', color: '#1a1a1a', marginBottom: '8px' }}>
          Sales History
        </Title>
        <Text style={{ color: '#666666', fontSize: '14px' }}>View all completed transactions</Text>
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
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Invoice No</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date & Time</th>
                <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
                <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment</th>
                <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale, index) => (
                <tr key={sale.id} style={{ borderBottom: index < sales.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
                  <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '600', fontFamily: 'monospace' }}>{sale.invoice_no}</td>
                  <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{sale.datetime}</td>
                  <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{sale.customer_name}</td>
                  <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {sale.total}</td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      background: sale.payment_method === 'cash' ? '#dcfce7' : '#dbeafe',
                      color: sale.payment_method === 'cash' ? '#16a34a' : '#2563eb',
                      textTransform: 'capitalize'
                    }}>
                      {sale.payment_method}
                    </span>
                  </td>
                  <td style={{ padding: '16px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleViewInvoice(sale)}
                      style={{
                        padding: '6px 16px',
                        background: '#f0f9ff',
                        border: '1px solid #bfdbfe',
                        borderRadius: '4px',
                        color: '#2563eb',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      View Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Dialog */}
      <Dialog
        open={dialogOpen}
        onAfterClose={() => setDialogOpen(false)}
        headerText="Invoice Details"
        style={{ width: '600px' }}
      >
        {selectedSale && (
          <div style={{ padding: '20px' }} id="invoice-print">
            <div style={{ borderBottom: '2px solid #e0e0e0', paddingBottom: '20px', marginBottom: '20px' }}>
              <Title level="H3" style={{ marginBottom: '8px', color: '#2563eb' }}>POS System</Title>
              <Text style={{ color: '#666666', fontSize: '14px' }}>Invoice: {selectedSale.invoice_no}</Text>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <Text style={{ fontSize: '12px', color: '#666666', display: 'block' }}>Customer:</Text>
                  <Text style={{ fontWeight: '600' }}>{selectedSale.customer_name}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: '12px', color: '#666666', display: 'block' }}>Date & Time:</Text>
                  <Text style={{ fontWeight: '600' }}>{selectedSale.datetime}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: '12px', color: '#666666', display: 'block' }}>Cashier:</Text>
                  <Text style={{ fontWeight: '600' }}>{selectedSale.cashier_name}</Text>
                </div>
                <div>
                  <Text style={{ fontSize: '12px', color: '#666666', display: 'block' }}>Payment:</Text>
                  <Text style={{ fontWeight: '600', textTransform: 'capitalize' }}>{selectedSale.payment_method}</Text>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Item</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Price</th>
                    <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedSale.items.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px' }}>{item.product_name}</td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>Rs. {item.price}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Rs. {item.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ borderTop: '2px solid #e0e0e0', paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Subtotal:</Text>
                <Text style={{ fontWeight: '600' }}>Rs. {selectedSale.subtotal}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <Text>Discount:</Text>
                <Text style={{ fontWeight: '600' }}>Rs. {selectedSale.discount}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <Text>Tax:</Text>
                <Text style={{ fontWeight: '600' }}>Rs. {selectedSale.tax}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '2px solid #e0e0e0' }}>
                <Text style={{ fontSize: '18px', fontWeight: '700' }}>Grand Total:</Text>
                <Text style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>Rs. {selectedSale.total}</Text>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
              <Button design="Emphasized" onClick={handlePrint} style={{ background: '#2563eb' }}>
                Print Invoice
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

export default Sales;
