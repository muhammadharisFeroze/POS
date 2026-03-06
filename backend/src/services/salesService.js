const pool = require('../config/database');

class SalesService {
  // Get all sales with filters
  static async getAllSales(filters = {}) {
    try {
      const { startDate, endDate, customerName, paymentMethod } = filters;

      let query = `
        SELECT s.*, u.name as cashier_name
        FROM sales s
        LEFT JOIN users u ON s.user_id = u.id
        WHERE 1=1
      `;
      const params = [];

      if (startDate) {
        params.push(startDate);
        query += ` AND s.datetime::date >= $${params.length}::date`;
      }

      if (endDate) {
        params.push(endDate);
        query += ` AND s.datetime::date <= $${params.length}::date`;
      }

      if (customerName) {
        params.push(`%${customerName}%`);
        query += ` AND s.customer_name ILIKE $${params.length}`;
      }

      if (paymentMethod) {
        params.push(paymentMethod);
        query += ` AND s.payment_method = $${params.length}`;
      }

      query += ` ORDER BY s.datetime DESC`;

      const result = await pool.query(query, params);

      return {
        sales: result.rows,
        total: result.rows.length
      };
    } catch (error) {
      throw new Error('Failed to fetch sales');
    }
  }

  // Get sale by ID with items
  static async getSaleById(id) {
    try {
      // Get sale details
      const saleResult = await pool.query(
        `SELECT s.*, u.name as cashier_name
         FROM sales s
         LEFT JOIN users u ON s.user_id = u.id
         WHERE s.id = $1`,
        [id]
      );

      if (saleResult.rows.length === 0) {
        throw new Error('Sale not found');
      }

      const sale = saleResult.rows[0];

      // Get sale items
      const itemsResult = await pool.query(
        `SELECT si.*, p.name as product_name
         FROM sale_items si
         JOIN products p ON si.product_id = p.id
         WHERE si.sale_id = $1`,
        [id]
      );

      sale.items = itemsResult.rows;

      return sale;
    } catch (error) {
      throw error;
    }
  }

  // Create new sale
  static async createSale(saleData, userId) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      const { customer_name, items, payment_method, cnic, transaction_id } = saleData;

      // Calculate totals
      let subtotal = 0;
      let totalDiscount = 0;
      let totalTax = 0;

      // Validate items and calculate totals
      for (const item of items) {
        const productResult = await client.query(
          'SELECT price, tax_percent FROM products WHERE id = $1 AND status = $2',
          [item.product_id, 'active']
        );

        if (productResult.rows.length === 0) {
          throw new Error(`Product with ID ${item.product_id} not found or inactive`);
        }

        const product = productResult.rows[0];
        const itemTotal = item.price * item.quantity;
        const itemDiscountPerUnit = item.discount || 0;
        const itemDiscountTotal = itemDiscountPerUnit * item.quantity;
        const itemTax = ((itemTotal - itemDiscountTotal) * product.tax_percent) / 100;

        subtotal += itemTotal;
        totalDiscount += itemDiscountTotal;
        totalTax += itemTax;
      }

      const total = subtotal - totalDiscount + totalTax;

      // Generate unique invoice number based on date
      // Format: INV-YYYYMMDD-XXX (e.g., INV-20260221-001)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      
      // Get today's invoice count to generate sequential number
      const countResult = await client.query(
        `SELECT COUNT(*) as count FROM sales WHERE invoice_no LIKE $1`,
        [`INV-${dateStr}-%`]
      );
      
      const todayCount = parseInt(countResult.rows[0].count) + 1;
      const seqNumber = String(todayCount).padStart(3, '0');
      
      const invoiceNumber = `INV-${dateStr}-${seqNumber}`;

      // Create sale record
      const saleResult = await client.query(
        `INSERT INTO sales (invoice_no, customer_name, cnic, transaction_id, subtotal, discount, tax, total, payment_method, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [invoiceNumber, customer_name || 'Walk-in Customer', cnic, transaction_id, subtotal, totalDiscount, totalTax, total, payment_method, userId]
      );

      const sale = saleResult.rows[0];

      // Create sale items and update stock
      for (const item of items) {
        const itemTotal = item.price * item.quantity;
        const itemDiscountPerUnit = item.discount || 0;
        const itemDiscountTotal = itemDiscountPerUnit * item.quantity;
        const itemTax = ((itemTotal - itemDiscountTotal) * item.tax_percent) / 100;
        
        await client.query(
          `INSERT INTO sale_items (sale_id, product_id, quantity, price, discount, tax, total)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [sale.id, item.product_id, item.quantity, item.price, itemDiscountTotal, itemTax, itemTotal - itemDiscountTotal + itemTax]
        );

        // Update product stock
        await client.query(
          'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
          [item.quantity, item.product_id]
        );
      }

      await client.query('COMMIT');

      // Return complete sale with items
      const completeSale = await this.getSaleById(sale.id);
      return completeSale;

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get dashboard statistics
  static async getDashboardStats(date = new Date()) {
    try {
      const today = date.toISOString().split('T')[0];
      
      // Get today's sales summary
      const todaySalesResult = await pool.query(
        `SELECT 
           COALESCE(SUM(total), 0) as today_sales,
           COALESCE(SUM(tax), 0) as total_tax,
           COUNT(*) as total_transactions
         FROM sales 
         WHERE datetime::date = $1`,
        [today]
      );

      // Get all-time total sales
      const allTimeSalesResult = await pool.query(
        `SELECT 
           COALESCE(SUM(total), 0) as total_sales
         FROM sales`
      );

      // Get low stock products
      const lowStockResult = await pool.query(
        `SELECT id, name, category, stock_qty, price 
         FROM products 
         WHERE status = 'active' AND stock_qty <= 10 
         ORDER BY stock_qty ASC
         LIMIT 5`
      );

      return {
        total_sales: allTimeSalesResult.rows[0].total_sales,
        today_sales: todaySalesResult.rows[0].today_sales,
        total_tax: todaySalesResult.rows[0].total_tax,
        total_transactions: todaySalesResult.rows[0].total_transactions,
        low_stock_products: lowStockResult.rows
      };
    } catch (error) {
      throw new Error('Failed to fetch dashboard stats');
    }
  }

  // Get sales report data
  static async getSalesReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
           datetime::date as date,
           COUNT(*) as transactions,
           SUM(subtotal) as subtotal,
           SUM(tax) as tax,
           SUM(total) as total
         FROM sales 
         WHERE datetime::date BETWEEN $1 AND $2
         GROUP BY datetime::date
         ORDER BY datetime::date DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch sales report');
    }
  }

  // Get product-wise sales report
  static async getProductWiseReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
           p.name as product,
           p.category,
           SUM(si.quantity) as quantity,
           SUM(CASE WHEN s.payment_method = 'cash' THEN si.total ELSE 0 END) as cash_sales,
           SUM(CASE WHEN s.payment_method = 'card' THEN si.total ELSE 0 END) as card_sales,
           SUM(si.total) as revenue
         FROM sale_items si
         JOIN sales s ON si.sale_id = s.id
         JOIN products p ON si.product_id = p.id
         WHERE s.datetime::date BETWEEN $1 AND $2
         GROUP BY p.id, p.name, p.category
         ORDER BY revenue DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch product-wise report');
    }
  }

  // Get tax report
  static async getTaxReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
           datetime::date as date,
           SUM(subtotal) as subtotal,
           SUM(tax) as tax_collected,
           SUM(total) as total
         FROM sales 
         WHERE datetime::date BETWEEN $1 AND $2
         GROUP BY datetime::date
         ORDER BY datetime::date DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch tax report');
    }
  }

  // Get user-wise sales report
  static async getUserWiseReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
           u.name as user_name,
           u.role,
           COUNT(s.id) as transaction_count,
           SUM(CASE WHEN s.payment_method = 'cash' THEN s.total ELSE 0 END) as cash_sales,
           SUM(CASE WHEN s.payment_method = 'card' THEN s.total ELSE 0 END) as card_sales,
           SUM(s.total) as total_sales
         FROM users u
         LEFT JOIN sales s ON u.id = s.user_id 
           AND s.datetime::date BETWEEN $1 AND $2
         GROUP BY u.id, u.name, u.role
         ORDER BY total_sales DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch user-wise report');
    }
  }

  // Get invoice-wise sales report
  static async getInvoiceWiseReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
           s.id,
           s.invoice_no,
           s.datetime,
           s.customer_name,
           s.payment_method,
           s.subtotal,
           s.discount,
           s.total,
           u.name as cashier_name,
           COUNT(si.id) as item_count,
           SUM(si.quantity) as total_quantity
         FROM sales s
         LEFT JOIN users u ON s.user_id = u.id
         LEFT JOIN sale_items si ON s.id = si.sale_id
         WHERE s.datetime::date BETWEEN $1 AND $2
         GROUP BY s.id, s.invoice_no, s.datetime, s.customer_name, 
                  s.payment_method, s.subtotal, s.discount, s.total, u.name
         ORDER BY s.datetime DESC`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch invoice-wise report');
    }
  }

  // Get user-wise daily sales report
  static async getUserWiseDailyReport(startDate, endDate) {
    try {
      const result = await pool.query(
        `SELECT 
           u.name as user_name,
           u.role,
           DATE(s.datetime) as sale_date,
           COUNT(s.id) as transaction_count,
           SUM(CASE WHEN s.payment_method = 'cash' THEN s.total ELSE 0 END) as cash_sales,
           SUM(CASE WHEN s.payment_method = 'card' THEN s.total ELSE 0 END) as card_sales,
           SUM(s.total) as total_sales
         FROM users u
         LEFT JOIN sales s ON u.id = s.user_id 
           AND s.datetime::date BETWEEN $1 AND $2
         GROUP BY u.id, u.name, u.role, DATE(s.datetime)
         HAVING COUNT(s.id) > 0
         ORDER BY DATE(s.datetime) DESC, u.name`,
        [startDate, endDate]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch user-wise daily report');
    }
  }
}

module.exports = SalesService;