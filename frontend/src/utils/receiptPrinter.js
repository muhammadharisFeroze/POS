/**
 * Thermal Receipt Printer Utility
 * Optimized for PTP-60 Thermal Printer:
 *   Media width : 80mm
 *   Print width : 72mm  (4mm margin each side)
 *   Resolution  : 203 DPI
 *   Line spacing: 3.75mm = ~14px
 *   Font A      : 1.5x3.0mm (12x24 dots) → 12px minimum for clean print
 */

import logoImage from '../assets/FML2.png';

export const generateThermalReceipt = (saleData) => {
  const printWindow = window.open('', '_blank', 'width=310,height=700');

  if (!printWindow) {
    alert('Please allow popups to print the receipt');
    return;
  }

  const { sale, items } = saleData;

  const receiptHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt - ${sale.invoice_no}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      /* Courier New: fixed-width, sharp edges — best for thermal */
      font-family: 'Courier New', Courier, monospace;
      /* 12px minimum for PTP-60 203dpi to avoid blurry/missing chars */
      font-size: 12px;
      font-weight: normal;
      /* Disable anti-aliasing — thermal printers need sharp pixel edges */
      -webkit-font-smoothing: none;
      -moz-osx-font-smoothing: unset;
      font-smooth: never;
      /* 66mm safe width within 72mm print area (browser adds ~6mm internal offset) */
      width: 66mm;
      margin: 0;
      padding: 3mm 1mm 5mm 3mm;
      background: white;
      color: #000;
      /* PTP-60 line spacing 3.75mm = 14px at 96dpi */
      line-height: 14px;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .receipt { width: 100%; }

    /* HEADER */
    .header {
      text-align: center;
      padding-bottom: 3mm;
      border-bottom: 1px dashed #000;
      margin-bottom: 3mm;
    }
    .logo { max-width: 100px; height: auto; display: block; margin: 0 auto 2mm; }
    .store-name { font-size: 15px; font-weight: normal; margin-bottom: 2mm; }
    .store-info { font-size: 11px; font-weight: normal; line-height: 14px; }

    /* INVOICE INFO */
    .invoice-info { font-size: 11px; line-height: 14px; margin-bottom: 2mm; }
    .inv-row { display: flex; justify-content: space-between; margin: 1mm 0; }
    .inv-label { font-weight: normal; min-width: 20mm; }

    /* ITEMS */
    .items-header {
      display: flex;
      justify-content: space-between;
      font-size: 11px;
      font-weight: normal;
      border-top: 1px dashed #000;
      border-bottom: 1px dashed #000;
      padding: 1.5mm 0;
      margin-bottom: 1.5mm;
    }
    .item-block { margin: 2mm 0; font-size: 11px; line-height: 14px; }
    .item-name-row { display: flex; justify-content: space-between; align-items: flex-start; }
    .item-name { flex: 1; font-weight: bold; padding-right: 2mm; word-break: break-word; }
    .item-amount { white-space: nowrap; font-weight: bold; }
    .item-sub-row {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      font-weight: normal;
      padding-left: 2mm;
      line-height: 13px;
    }

    /* SUMMARY */
    .summary {
      border-top: 1px dashed #000;
      padding-top: 2mm;
      margin-top: 1mm;
      font-size: 11px;
      line-height: 14px;
    }
    .sum-row { display: flex; justify-content: space-between; margin: 1mm 0; }
    .sum-row.total {
      font-size: 13px;
      font-weight: bold;
      margin-top: 2mm;
      padding-top: 2mm;
      border-top: 1px dashed #000;
    }

    /* FOOTER */
    .footer {
      text-align: center;
      border-top: 1px dashed #000;
      margin-top: 3mm;
      padding-top: 3mm;
      font-size: 10px;
      line-height: 14px;
    }
    .thank-you { font-size: 14px; font-weight: normal; margin-bottom: 1mm; }
    .terms-section {
      margin-top: 3mm;
      padding-top: 2mm;
      border-top: 1px dashed #000;
      font-size: 10px;
      font-weight: normal;
      line-height: 14px;
      text-align: left;
    }
    .terms-title {
      font-size: 11px; font-weight: normal;
      text-decoration: underline; text-align: center;
      margin-bottom: 1.5mm;
    }
    .footer-brand {
      margin-top: 3mm; padding-top: 2mm;
      border-top: 1px dashed #000;
      font-weight: normal; font-size: 11px;
    }
    .footer-powered { font-size: 10px; font-weight: normal; margin-top: 1mm; }

    /* PRINT MEDIA */
    @media print {
      html, body {
        width: 66mm;
        margin: 0 !important;
        padding: 3mm 1mm 5mm 3mm !important;
        font-size: 12px !important;
        -webkit-font-smoothing: none !important;
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

  <!-- HEADER -->
  <div class="header">
    <img src="${logoImage}" alt="Feroze1888 Mills LTD" class="logo" />
    <div class="store-name">Feroze1888 Mills LTD</div>
    <div class="store-info">
      Point of Sale System<br>
    </div>
  </div>

  <!-- INVOICE INFO -->
  <div class="invoice-info">
    <div class="inv-row">
      <span class="inv-label">Invoice #:</span>
      <span><strong>${sale.invoice_no}</strong></span>
    </div>
    <div class="inv-row">
      <span class="inv-label">Date:</span>
      <span>${new Date(sale.datetime).toLocaleString('en-PK', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true
      })}</span>
    </div>
    <div class="inv-row">
      <span class="inv-label">Customer:</span>
      <span>${sale.customer_name}</span>
    </div>
    <div class="inv-row">
      <span class="inv-label">Payment:</span>
      <span>${sale.payment_method.toUpperCase()}</span>
    </div>
  </div>

  <!-- ITEMS HEADER -->
  <div class="items-header">
    <span>Description</span>
    <span>Amount</span>
  </div>

  <!-- ITEMS -->
  ${items.map(item => {
    const itemSubtotal = parseFloat(item.price) * parseInt(item.quantity);
    const itemDiscount = parseFloat(item.discount || 0);
    return `
    <div class="item-block">
      <div class="item-name-row">
        <span class="item-name">${item.product_name || item.name}</span>
        <span class="item-amount">Rs.${(itemSubtotal - itemDiscount).toFixed(2)}</span>
      </div>
      <div class="item-sub-row">
        <span>${item.quantity} x Rs.${parseFloat(item.price).toFixed(2)}</span>
        ${itemDiscount > 0 ? `<span>-Rs.${itemDiscount.toFixed(2)}</span>` : ''}
      </div>
    </div>`;
  }).join('')}

  <!-- SUMMARY -->
  <div class="summary">
    <div class="sum-row">
      <span>Subtotal:</span>
      <span>Rs. ${parseFloat(sale.subtotal).toFixed(2)}</span>
    </div>
    ${parseFloat(sale.discount) > 0 ? `
    <div class="sum-row">
      <span>Discount:</span>
      <span>-Rs. ${parseFloat(sale.discount).toFixed(2)}</span>
    </div>` : ''}
    <div class="sum-row total">
      <span>TOTAL:</span>
      <span>Rs. ${parseFloat(sale.total).toFixed(2)}</span>
    </div>
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <div class="thank-you">THANK YOU!</div>
    <div>Visit Again</div>
    <div class="terms-section">
      <div class="terms-title">TERMS &amp; CONDITIONS</div>
      &bull; All sales are final. No exchange or return.<br>
      &bull; Receipt is proof of payment. Keep for records.<br>
      &bull; Prices inclusive of applicable taxes.
    </div>
  </div>

  <div style="text-align:center; border-top: 1px dashed #000; margin-top: 3mm; padding-top: 2mm; font-size: 10px;">
    Powered by Feroze1888 Mills LTD
  </div>

</div>
</body>
</html>`;

  printWindow.document.write(receiptHTML);
  printWindow.document.close();
};

/**
 * Format sale data from API response for receipt printing
 */
export const formatSaleForReceipt = (apiResponse) => {
  const saleData = apiResponse.sale || apiResponse;
  const items = apiResponse.items || saleData.items || [];

  if (!saleData || !saleData.invoice_no) {
    console.error('Invalid sale data for receipt:', apiResponse);
    return null;
  }

  return { sale: saleData, items };
};
