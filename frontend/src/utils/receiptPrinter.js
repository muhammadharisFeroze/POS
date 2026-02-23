/**
 * Thermal Receipt Printer Utility
 * Generates a thermal-style receipt PDF (80mm width)
 */

import logoImage from '../assets/Feroze-1888.png';

export const generateThermalReceipt = (saleData) => {
  // Thermal receipt width: 80mm = ~302px at 96 DPI
  const receiptWidth = 80; // mm
  const margin = 5; // mm
  
  // Create print window
  const printWindow = window.open('', '_blank', 'width=302,height=600');
  
  if (!printWindow) {
    alert('Please allow popups to print the receipt');
    return;
  }

  const { sale, items } = saleData;
  
  // Generate HTML for thermal receipt
  const receiptHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Receipt - ${sale.invoice_no}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          width: 80mm;
          padding: 5mm;
          background: white;
          color: black;
        }
        
        .receipt {
          width: 100%;
        }
        
        .header {
          text-align: center;
          margin-bottom: 10px;
          border-bottom: 2px dashed #000;
          padding-bottom: 10px;
        }
        
        .logo-container {
          margin-bottom: 10px;
        }
        
        .logo {
          max-width: 120px;
          height: auto;
          margin: 0 auto;
          display: block;
        }
        
        .store-name {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .store-info {
          font-size: 10px;
          line-height: 1.4;
        }
        
        .invoice-info {
          margin: 10px 0;
          font-size: 11px;
        }
        
        .invoice-info div {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
        }
        
        .items-table {
          width: 100%;
          margin: 10px 0;
          border-top: 1px dashed #000;
          border-bottom: 1px dashed #000;
          padding: 5px 0;
        }
        
        .item-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
          font-size: 11px;
        }
        
        .item-name {
          flex: 1;
          font-weight: bold;
        }
        
        .item-details {
          display: flex;
          justify-content: space-between;
          font-size: 10px;
          color: #333;
          margin-left: 10px;
        }
        
        .item-qty {
          margin-right: 10px;
        }
        
        .summary {
          margin: 10px 0;
          font-size: 11px;
        }
        
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin: 5px 0;
        }
        
        .summary-row.total {
          font-size: 14px;
          font-weight: bold;
          margin-top: 10px;
          padding-top: 5px;
          border-top: 2px dashed #000;
        }
        
        .footer {
          text-align: center;
          margin-top: 15px;
          padding-top: 10px;
          border-top: 2px dashed #000;
          font-size: 10px;
        }
        
        .thank-you {
          font-size: 14px;
          font-weight: bold;
          margin: 10px 0;
        }
        
        .terms-section {
          margin-top: 15px;
          padding-top: 10px;
          border-top: 1px dashed #000;
          font-size: 9px;
          text-align: center;
          line-height: 1.6;
        }
        
        .terms-title {
          font-size: 11px;
          font-weight: bold;
          margin-bottom: 8px;
          text-decoration: underline;
        }
        
        .terms-text {
          text-align: left;
          margin: 5px 10px;
          line-height: 1.5;
        }
        
        @media print {
          body {
            width: 80mm;
          }
          
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      </style>
    </head>
    <body onload="window.print(); window.onafterprint = function(){ window.close(); }">
      <div class="receipt">
        <div class="header">
          <div class="logo-container">
            <img src="${logoImage}" alt="Feroze1888 Mills LTD" class="logo" />
          </div>
          <div class="store-name">Feroze1888 Mills LTD</div>
          <div class="store-info">
            Point of Sale System<br>
            Phone: +92 XXX XXXXXXX<br>
            NTN: XXXXXXXXX
          </div>
        </div>
        
        <div class="invoice-info">
          <div>
            <span>Invoice #:</span>
            <span><strong>${sale.invoice_no}</strong></span>
          </div>
          <div>
            <span>Date:</span>
            <span>${new Date(sale.datetime).toLocaleString('en-US', { 
              year: 'numeric', 
              month: 'short', 
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}</span>
          </div>
          <div>
            <span>Customer:</span>
            <span>${sale.customer_name}</span>
          </div>
          <div>
            <span>Payment:</span>
            <span>${sale.payment_method.toUpperCase()}</span>
          </div>
        </div>
        
        <div class="items-table">
          ${items.map(item => {
            const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
            const itemDiscount = parseFloat(item.discount || 0);
            
            return `
            <div style="margin-bottom: 8px;">
              <div class="item-row">
                <span class="item-name">${item.product_name || item.name}</span>
                <span><strong>Rs. ${(itemSubtotal - itemDiscount).toFixed(2)}</strong></span>
              </div>
              <div class="item-details">
                <span class="item-qty">${item.quantity} x Rs. ${parseFloat(item.price).toFixed(2)}</span>
                ${itemDiscount > 0 ? `<span style="color: #dc2626;">-Rs. ${itemDiscount.toFixed(2)}</span>` : ''}
              </div>
            </div>
            `;
          }).join('')}
        </div>
        
        <div class="summary">
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>Rs. ${parseFloat(sale.subtotal).toFixed(2)}</span>
          </div>
          ${parseFloat(sale.discount) > 0 ? `
            <div class="summary-row" style="color: #dc2626;">
              <span>Discount:</span>
              <span>-Rs. ${parseFloat(sale.discount).toFixed(2)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span>TOTAL:</span>
            <span>Rs. ${parseFloat(sale.total).toFixed(2)}</span>
          </div>
        </div>
        
        <div class="footer">
          <div class="thank-you">THANK YOU!</div>
          <div>Visit Again</div>
          
          <div class="terms-section">
            <div class="terms-title">TERMS & CONDITIONS</div>
            <div class="terms-text">
              • All sales are final. No exchange<br>
              &nbsp;&nbsp;or return policy.<br><br>
              • This receipt is proof of payment.<br>
              &nbsp;&nbsp;Please keep for your records.<br><br>
              • Prices are inclusive of all<br>
              &nbsp;&nbsp;applicable taxes.
            </div>
          </div>
          
          <div style="margin-top: 15px; font-weight: bold; border-top: 1px dashed #000; padding-top: 10px;">Feroze1888 Mills LTD</div>
          <div style="margin-top: 5px; font-size: 9px;">Powered by Feroze1888 Mills LTD</div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
};

/**
 * Format sale data from API response for receipt printing
 */
export const formatSaleForReceipt = (apiResponse) => {
  // Handle both direct sale object and wrapped response
  const saleData = apiResponse.sale || apiResponse;
  const items = apiResponse.items || saleData.items || [];
  
  if (!saleData || !saleData.invoice_no) {
    console.error('Invalid sale data for receipt:', apiResponse);
    return null;
  }

  return {
    sale: saleData,
    items: items
  };
};
