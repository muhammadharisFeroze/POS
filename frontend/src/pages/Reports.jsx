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
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './Reports.css';

const Reports = () => {
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const [reportType, setReportType] = useState('daily');
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTodayDate());
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
      }
      else if (reportType === 'product') {
        response = await salesAPI.getProductWiseReport(params);
      }
      // else if (reportType === 'tax') {
      //   response = await salesAPI.getTaxReport(params);
      // }
      else if (reportType === 'userwise') {
        response = await salesAPI.getUserWiseReport(params);
      }
      else if (reportType === 'invoice') {
        response = await salesAPI.getInvoiceWiseReport(params);
      }
      else if (reportType === 'userwisedaily') {
        response = await salesAPI.getUserWiseDailyReport(params);
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

  const exportToPDF = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // Add title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    let reportTitle = '';
    if (reportType === 'daily') reportTitle = 'Daily Sales Report';
    else if (reportType === 'product') reportTitle = 'Product-wise Sales Report';
    else if (reportType === 'userwise') reportTitle = 'User-wise Transaction Report';
    else if (reportType === 'tax') reportTitle = 'Tax Report';
    else if (reportType === 'invoice') reportTitle = 'Invoice-wise Sales Report';
    else if (reportType === 'userwisedaily') reportTitle = 'User-wise Daily Sales Report';

    doc.text(reportTitle, pageWidth / 2, 15, { align: 'center' });

    // Add date range
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${startDate} to ${endDate}`, pageWidth / 2, 22, { align: 'center' });

    // Prepare table data based on report type
    let headers = [];
    let rows = [];
    let totalsRow = [];

    if (reportType === 'daily') {
      headers = [['Date', 'Transactions', 'Subtotal (Rs.)', 'Tax (Rs.)', 'Total (Rs.)']];
      rows = reportData.map(row => [
        row.date,
        row.transactions,
        parseFloat(row.subtotal).toFixed(2),
        parseFloat(row.tax).toFixed(2),
        parseFloat(row.total).toFixed(2)
      ]);
      totalsRow = ['TOTAL',
        reportData.reduce((sum, row) => sum + parseInt(row.transactions || 0), 0),
        reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.tax || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)
      ];
    } else if (reportType === 'product') {
      headers = [['Product Name', 'Category', 'Qty Sold', 'Cash Sales (Rs.)', 'Card Sales (Rs.)', 'Total Revenue (Rs.)']];
      rows = reportData.map(row => [
        row.product || row.name,
        row.category,
        row.quantity || row.quantity_sold,
        parseFloat(row.cash_sales || 0).toFixed(2),
        parseFloat(row.card_sales || 0).toFixed(2),
        parseFloat(row.revenue || row.total_revenue).toFixed(2)
      ]);
      totalsRow = ['TOTAL', '',
        reportData.reduce((sum, row) => sum + parseInt(row.quantity || row.quantity_sold || 0), 0),
        reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.revenue || row.total_revenue || 0), 0).toFixed(2)
      ];
    } else if (reportType === 'userwise') {
      headers = [['User Name', 'Role', 'Transactions', 'Cash Sales (Rs.)', 'Card Sales (Rs.)', 'Total Sales (Rs.)']];
      rows = reportData.map(row => [
        row.user_name,
        row.role,
        row.transaction_count,
        parseFloat(row.cash_sales || 0).toFixed(2),
        parseFloat(row.card_sales || 0).toFixed(2),
        parseFloat(row.total_sales).toFixed(2)
      ]);
      totalsRow = ['TOTAL', '',
        reportData.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0),
        reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0).toFixed(2)
      ];
    } else if (reportType === 'tax') {
      headers = [['Date', 'Subtotal (Rs.)', 'Tax Collected (Rs.)', 'Total (Rs.)']];
      rows = reportData.map(row => [
        row.date,
        parseFloat(row.subtotal).toFixed(2),
        parseFloat(row.tax || row.tax_collected).toFixed(2),
        parseFloat(row.total).toFixed(2)
      ]);
      totalsRow = ['TOTAL',
        reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.tax || row.tax_collected || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)
      ];
    } else if (reportType === 'invoice') {
      headers = [['Trans ID', 'Invoice No', 'Date', 'Customer', 'Items', 'Qty', 'Payment', 'Subtotal', 'Discount', 'Total']];
      rows = reportData.map(row => [
        row.transaction_id,
        row.invoice_no,
        new Date(row.datetime).toLocaleDateString('en-PK'),
        row.customer_name,
        row.item_count,
        row.total_quantity,
        row.payment_method.toUpperCase(),
        parseFloat(row.subtotal).toFixed(2),
        parseFloat(row.discount).toFixed(2),
        parseFloat(row.total).toFixed(2)
      ]);
      totalsRow = ['TOTAL', '', '', '',
        reportData.reduce((sum, row) => sum + parseInt(row.item_count || 0), 0),
        reportData.reduce((sum, row) => sum + parseInt(row.total_quantity || 0), 0),
        '',
        reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.discount || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)
      ];
    } else if (reportType === 'userwisedaily') {
      headers = [['Date', 'User Name', 'Role', 'Transactions', 'Cash Sales', 'Card Sales', 'Total Sales']];
      rows = reportData.map(row => [
        new Date(row.sale_date).toLocaleDateString('en-PK'),
        row.user_name,
        row.role,
        row.transaction_count,
        parseFloat(row.cash_sales || 0).toFixed(2),
        parseFloat(row.card_sales || 0).toFixed(2),
        parseFloat(row.total_sales).toFixed(2)
      ]);
      totalsRow = ['TOTAL', '', '',
        reportData.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0),
        reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2),
        reportData.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0).toFixed(2)
      ];
    }

    // Add totals row
    rows.push(totalsRow);

    // Generate table
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 28,
      theme: 'grid',
      headStyles: {
        fillColor: [37, 99, 235],
        textColor: 255,
        fontStyle: 'bold'
      },
      footStyles: {
        fillColor: [240, 240, 240],
        textColor: 0,
        fontStyle: 'bold'
      },
      didParseCell: function (data) {
        // Make the last row (totals) bold
        if (data.row.index === rows.length - 1) {
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fillColor = [250, 250, 250];
        }
      }
    });

    // Add footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text(
        `Generated on ${new Date().toLocaleString()} | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // Save PDF
    doc.save(`${reportTitle.replace(/ /g, '_')}_${startDate}_to_${endDate}.pdf`);
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      alert('No data to export');
      return;
    }

    let worksheetData = [];
    let reportTitle = '';

    if (reportType === 'daily') {
      reportTitle = 'Daily Sales Report';
      worksheetData = [
        ['Daily Sales Report'],
        [`Period: ${startDate} to ${endDate}`],
        [],
        ['Date', 'Transactions', 'Subtotal (Rs.)', 'Tax (Rs.)', 'Total (Rs.)'],
        ...reportData.map(row => [
          row.date,
          row.transactions,
          parseFloat(row.subtotal).toFixed(2),
          parseFloat(row.tax).toFixed(2),
          parseFloat(row.total).toFixed(2)
        ]),
        [],
        [
          'TOTAL',
          reportData.reduce((sum, row) => sum + parseInt(row.transactions || 0), 0),
          reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.tax || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)
        ]
      ];
    } else if (reportType === 'product') {
      reportTitle = 'Product-wise Sales Report';
      worksheetData = [
        ['Product-wise Sales Report'],
        [`Period: ${startDate} to ${endDate}`],
        [],
        ['Product Name', 'Category', 'Qty Sold', 'Cash Sales (Rs.)', 'Card Sales (Rs.)', 'Total Revenue (Rs.)'],
        ...reportData.map(row => [
          row.product || row.name,
          row.category,
          row.quantity || row.quantity_sold,
          parseFloat(row.cash_sales || 0).toFixed(2),
          parseFloat(row.card_sales || 0).toFixed(2),
          parseFloat(row.revenue || row.total_revenue).toFixed(2)
        ]),
        [],
        [
          'TOTAL',
          '',
          reportData.reduce((sum, row) => sum + parseInt(row.quantity || row.quantity_sold || 0), 0),
          reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.revenue || row.total_revenue || 0), 0).toFixed(2)
        ]
      ];
    } else if (reportType === 'userwise') {
      reportTitle = 'User-wise Transaction Report';
      worksheetData = [
        ['User-wise Transaction Report'],
        [`Period: ${startDate} to ${endDate}`],
        [],
        ['User Name', 'Role', 'Transactions', 'Cash Sales (Rs.)', 'Card Sales (Rs.)', 'Total Sales (Rs.)'],
        ...reportData.map(row => [
          row.user_name,
          row.role,
          row.transaction_count,
          parseFloat(row.cash_sales || 0).toFixed(2),
          parseFloat(row.card_sales || 0).toFixed(2),
          parseFloat(row.total_sales).toFixed(2)
        ]),
        [],
        [
          'TOTAL',
          '',
          reportData.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0),
          reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0).toFixed(2)
        ]
      ];
    } else if (reportType === 'tax') {
      reportTitle = 'Tax Report';
      worksheetData = [
        ['Tax Report'],
        [`Period: ${startDate} to ${endDate}`],
        [],
        ['Date', 'Subtotal (Rs.)', 'Tax Collected (Rs.)', 'Total (Rs.)'],
        ...reportData.map(row => [
          row.date,
          parseFloat(row.subtotal).toFixed(2),
          parseFloat(row.tax || row.tax_collected).toFixed(2),
          parseFloat(row.total).toFixed(2)
        ]),
        [],
        [
          'TOTAL',
          reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.tax || row.tax_collected || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)
        ]
      ];
    } else if (reportType === 'invoice') {
      reportTitle = 'Invoice-wise Sales Report';
      worksheetData = [
        ['Invoice-wise Sales Report'],
        [`Period: ${startDate} to ${endDate}`],
        [],
        ['Invoice No', 'Date', 'Customer', 'Items', 'Qty', 'Payment', 'Trans ID', 'Subtotal (Rs.)', 'Discount (Rs.)', 'Total (Rs.)'],
        ...reportData.map(row => [

          row.invoice_no,
          new Date(row.datetime).toLocaleString('en-PK'),
          row.customer_name,
          row.item_count,
          row.total_quantity,
          row.payment_method.toUpperCase(),
          row.transaction_id,
          parseFloat(row.subtotal).toFixed(2),
          parseFloat(row.discount).toFixed(2),
          parseFloat(row.total).toFixed(2)
        ]),
        [],
        [
          'TOTAL', '', '', '',
          reportData.reduce((sum, row) => sum + parseInt(row.item_count || 0), 0),
          reportData.reduce((sum, row) => sum + parseInt(row.total_quantity || 0), 0),
          '',
          reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.discount || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.total || 0), 0).toFixed(2)
        ]
      ];
    } else if (reportType === 'userwisedaily') {
      reportTitle = 'User-wise Daily Sales Report';
      worksheetData = [
        ['User-wise Daily Sales Report'],
        [`Period: ${startDate} to ${endDate}`],
        [],
        ['Date', 'User Name', 'Role', 'Transactions', 'Cash Sales (Rs.)', 'Card Sales (Rs.)', 'Total Sales (Rs.)'],
        ...reportData.map(row => [
          new Date(row.sale_date).toLocaleDateString('en-PK'),
          row.user_name,
          row.role,
          row.transaction_count,
          parseFloat(row.cash_sales || 0).toFixed(2),
          parseFloat(row.card_sales || 0).toFixed(2),
          parseFloat(row.total_sales).toFixed(2)
        ]),
        [],
        [
          'TOTAL', '', '',
          reportData.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0),
          reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2),
          reportData.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0).toFixed(2)
        ]
      ];
    }

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, reportTitle.substring(0, 31));

    // Save Excel file
    XLSX.writeFile(workbook, `${reportTitle.replace(/ /g, '_')}_${startDate}_to_${endDate}.xlsx`);
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
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash Sales</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card Sales</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.product || row.name}</td>
              <td style={{ padding: '16px', color: '#666666', fontSize: '14px' }}>{row.category}</td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.quantity || row.quantity_sold}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.cash_sales || 0).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#7c3aed', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.card_sales || 0).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.revenue || row.total_revenue).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td colSpan="2" style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.quantity || row.quantity_sold || 0), 0)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#7c3aed' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
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

  const renderUserWiseReport = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Name</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash Sales</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card Sales</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.user_name}</td>
              <td style={{ padding: '16px', color: '#666666', fontSize: '13px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: row.role === 'admin' ? '#eff6ff' : '#fef3c7',
                  color: row.role === 'admin' ? '#2563eb' : '#d97706',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {row.role}
                </span>
              </td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.transaction_count}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.cash_sales || 0).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#7c3aed', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.card_sales || 0).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.total_sales).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td colSpan="2" style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#7c3aed' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0).toFixed(2)}
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

  const renderInvoiceWiseReport = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '160px', whiteSpace: 'nowrap' }}>Invoice No</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Customer</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Items</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Qty</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Payment</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '80px', whiteSpace: 'nowrap' }}>Trans ID</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Subtotal</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '100px', whiteSpace: 'nowrap' }}>Discount</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '600', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{row.invoice_no}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{new Date(row.datetime).toLocaleDateString('en-PK')}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.customer_name}</td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.item_count}</td>
              <td style={{ padding: '16px', color: '#7c3aed', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.total_quantity}</td>
              <td style={{ padding: '16px', textAlign: 'center' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: row.payment_method === 'cash' ? '#dcfce7' : '#dbeafe',
                  color: row.payment_method === 'cash' ? '#16a34a' : '#2563eb',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {row.payment_method}
                </span>
              </td>
              <td style={{ padding: '16px', color: '#666666', fontSize: '14px', fontWeight: '500', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{row.transaction_id}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.subtotal).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#dc2626', fontSize: '14px', fontWeight: '600', textAlign: 'right', whiteSpace: 'nowrap' }}>Rs. {parseFloat(row.discount).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.total).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td colSpan="4" style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.item_count || 0), 0)}
              </td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#7c3aed' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.total_quantity || 0), 0)}
              </td>
              <td style={{ padding: '16px' }}></td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.subtotal || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#dc2626' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.discount || 0), 0).toFixed(2)}
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

  const renderUserWiseDailyReport = () => (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Date</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>User Name</th>
            <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Role</th>
            <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Transactions</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cash Sales</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Card Sales</th>
            <th style={{ padding: '16px', textAlign: 'right', fontWeight: '600', color: '#1a1a1a', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Sales</th>
          </tr>
        </thead>
        <tbody>
          {reportData.map((row, index) => (
            <tr key={index} style={{ borderBottom: index < reportData.length - 1 ? '1px solid #f0f0f0' : 'none' }}>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{new Date(row.sale_date).toLocaleDateString('en-PK')}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '500' }}>{row.user_name}</td>
              <td style={{ padding: '16px', color: '#666666', fontSize: '13px' }}>
                <span style={{
                  padding: '4px 8px',
                  borderRadius: '4px',
                  background: row.role === 'admin' ? '#eff6ff' : '#fef3c7',
                  color: row.role === 'admin' ? '#2563eb' : '#d97706',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'uppercase'
                }}>
                  {row.role}
                </span>
              </td>
              <td style={{ padding: '16px', color: '#2563eb', fontSize: '14px', fontWeight: '700', textAlign: 'center' }}>{row.transaction_count}</td>
              <td style={{ padding: '16px', color: '#16a34a', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.cash_sales || 0).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#7c3aed', fontSize: '14px', fontWeight: '600', textAlign: 'right' }}>Rs. {parseFloat(row.card_sales || 0).toFixed(2)}</td>
              <td style={{ padding: '16px', color: '#1a1a1a', fontSize: '14px', fontWeight: '700', textAlign: 'right' }}>Rs. {parseFloat(row.total_sales).toFixed(2)}</td>
            </tr>
          ))}
          {reportData.length > 0 && (
            <tr style={{ borderTop: '2px solid #e0e0e0', background: '#fafafa' }}>
              <td colSpan="3" style={{ padding: '16px', fontWeight: '700' }}>TOTAL</td>
              <td style={{ padding: '16px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>
                {reportData.reduce((sum, row) => sum + parseInt(row.transaction_count || 0), 0)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.cash_sales || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', color: '#7c3aed' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.card_sales || 0), 0).toFixed(2)}
              </td>
              <td style={{ padding: '16px', textAlign: 'right', fontWeight: '700', fontSize: '16px', color: '#2563eb' }}>
                Rs. {reportData.reduce((sum, row) => sum + parseFloat(row.total_sales || 0), 0).toFixed(2)}
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
              <Option value="userwise">User-wise Transactions</Option>
              <Option value="userwisedaily">User-wise Daily Sales</Option>
              <Option value="invoice">Invoice-wise Sales</Option>
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
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              design="Emphasized"
              onClick={exportToPDF}
              style={{ background: '#dc2626' }}
              disabled={loading || reportData.length === 0}
            >
              Export to PDF
            </Button>
            <Button
              design="Emphasized"
              onClick={exportToExcel}
              style={{ background: '#16a34a' }}
              disabled={loading || reportData.length === 0}
            >
              Export to Excel
            </Button>
          </div>
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
          {reportType === 'userwise' && 'User-wise Transaction Report'}
          {reportType === 'userwisedaily' && 'User-wise Daily Sales Report'}
          {reportType === 'tax' && 'Tax Report'}
          {reportType === 'invoice' && 'Invoice-wise Sales Report'}
        </Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <BusyIndicator active />
          </div>
        ) : (
          <>
            {reportType === 'daily' && renderDailySalesReport()}
            {reportType === 'product' && renderProductWiseReport()}
            {reportType === 'userwise' && renderUserWiseReport()}
            {reportType === 'userwisedaily' && renderUserWiseDailyReport()}
            {reportType === 'tax' && renderTaxReport()}
            {reportType === 'invoice' && renderInvoiceWiseReport()}
          </>
        )}
      </div>
    </div>
  );
};

export default Reports;
