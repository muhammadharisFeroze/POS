const pool = require('../config/database');

// Create sale
exports.createSale = async (req, res) => {
  const client = await pool.connect();
  
  try {
    const {
      customer_name = 'Walk-in Customer',
      items,
      invoice_discount = 0,
      payment_method
    } = req.body;

    await client.query('BEGIN');

    // Calculate totals
    let subtotal = 0;
    let totalTax = 0;
    const processedItems = [];

    for (const item of items) {
      // Get product details
      const productResult = await client.query(
        'SELECT * FROM products WHERE id = $1 AND status = $2',
        [item.product_id, 'active']
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not found or inactive`);
      }

      const product = productResult.rows[0];

      // Check stock
      if (product.stock_qty < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }

      // Calculate line totals
      const lineTotal = product.price * item.quantity;
      const lineDiscount = item.discount || 0;
      const taxableAmount = lineTotal - lineDiscount;
      const lineTax = (taxableAmount * product.tax_percent) / 100;
      const itemTotal = taxableAmount + lineTax;

      processedItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: product.price,
        discount: lineDiscount,
        tax: lineTax,
        total: itemTotal,
        product_name: product.name
      });

      subtotal += lineTotal;
      totalTax += lineTax;

      // Update stock
      await client.query(
        'UPDATE products SET stock_qty = stock_qty - $1 WHERE id = $2',
        [item.quantity, product.id]
      );
    }

    // Calculate grand total
    const grandTotal = subtotal - invoice_discount + totalTax;

    // Generate invoice number
    const invoiceNo = `INV-${Date.now()}`;

    // Insert sale
    const saleResult = await client.query(
      `INSERT INTO sales (invoice_no, customer_name, subtotal, discount, tax, total, payment_method, user_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [invoiceNo, customer_name, subtotal, invoice_discount, totalTax, grandTotal, payment_method, req.user.id]
    );

    const sale = saleResult.rows[0];

    // Insert sale items
    for (const item of processedItems) {
      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, price, discount, tax, total)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [sale.id, item.product_id, item.quantity, item.price, item.discount, item.tax, item.total]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Sale completed successfully',
      sale: {
        ...sale,
        items: processedItems
      }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create sale error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  } finally {
    client.release();
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const { page = 1, limit = 10, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.*, u.name as cashier_name
      FROM sales s
      LEFT JOIN users u ON s.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (start_date) {
      params.push(start_date);
      query += ` AND s.datetime >= $${params.length}`;
    }

    if (end_date) {
      params.push(end_date);
      query += ` AND s.datetime <= $${params.length}`;
    }

    query += ` ORDER BY s.datetime DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM sales WHERE 1=1';
    const countParams = [];
    
    if (start_date) {
      countParams.push(start_date);
      countQuery += ` AND datetime >= $${countParams.length}`;
    }
    
    if (end_date) {
      countParams.push(end_date);
      countQuery += ` AND datetime <= $${countParams.length}`;
    }

    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      sales: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const { id } = req.params;

    const saleResult = await pool.query(
      `SELECT s.*, u.name as cashier_name
       FROM sales s
       LEFT JOIN users u ON s.user_id = u.id
       WHERE s.id = $1`,
      [id]
    );

    if (saleResult.rows.length === 0) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    const itemsResult = await pool.query(
      `SELECT si.*, p.name as product_name
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.id
       WHERE si.sale_id = $1`,
      [id]
    );

    res.json({
      ...saleResult.rows[0],
      items: itemsResult.rows
    });
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Total sales today
    const salesResult = await pool.query(
      'SELECT COALESCE(SUM(total), 0) as total_sales, COALESCE(SUM(tax), 0) as total_tax, COUNT(*) as total_transactions FROM sales WHERE datetime >= $1',
      [today]
    );

    // Low stock products
    const lowStockResult = await pool.query(
      'SELECT * FROM products WHERE stock_qty < 10 AND status = $1 ORDER BY stock_qty ASC LIMIT 10',
      ['active']
    );

    res.json({
      total_sales: parseFloat(salesResult.rows[0].total_sales),
      total_tax: parseFloat(salesResult.rows[0].total_tax),
      total_transactions: parseInt(salesResult.rows[0].total_transactions),
      low_stock_products: lowStockResult.rows
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reports
exports.getDailySalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const result = await pool.query(
      `SELECT DATE(datetime) as date, COUNT(*) as transactions, SUM(subtotal) as subtotal, SUM(discount) as discount, SUM(tax) as tax, SUM(total) as total
       FROM sales
       WHERE datetime >= $1 AND datetime <= $2
       GROUP BY DATE(datetime)
       ORDER BY date DESC`,
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Daily sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProductWiseSalesReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const result = await pool.query(
      `SELECT p.name, p.category, SUM(si.quantity) as quantity_sold, SUM(si.total) as total_revenue
       FROM sale_items si
       JOIN products p ON si.product_id = p.id
       JOIN sales s ON si.sale_id = s.id
       WHERE s.datetime >= $1 AND s.datetime <= $2
       GROUP BY p.id, p.name, p.category
       ORDER BY total_revenue DESC`,
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Product-wise sales report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getTaxReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    const result = await pool.query(
      `SELECT DATE(datetime) as date, SUM(subtotal) as subtotal, SUM(tax) as tax, SUM(total) as total
       FROM sales
       WHERE datetime >= $1 AND datetime <= $2
       GROUP BY DATE(datetime)
       ORDER BY date DESC`,
      [start_date, end_date]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Tax report error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
