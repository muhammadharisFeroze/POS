const pool = require('../config/database');

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { search, status } = req.query;

    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (name ILIKE $${params.length} OR barcode ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      query += ` AND status = $${params.length}`;
    }

    query += ` ORDER BY created_at DESC`;

    const result = await pool.query(query, params);

    res.json({
      products: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create product
exports.createProduct = async (req, res) => {
  try {
    const { name, barcode, category, price, tax_percent, stock_qty, unit, status } = req.body;

    // Validate barcode uniqueness if provided
    if (barcode) {
      const existingProduct = await pool.query(
        'SELECT id FROM products WHERE barcode = $1',
        [barcode]
      );
      
      if (existingProduct.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Product with SKU/Barcode "${barcode}" already exists` 
        });
      }
    }

    // Validate and sanitize inputs
    const sanitizedCategory = category && category.trim() !== '' ? category : null;
    const sanitizedTaxPercent = tax_percent && tax_percent !== '' ? parseFloat(tax_percent) : 0;
    const sanitizedStockQty = stock_qty && stock_qty !== '' ? parseInt(stock_qty) : 0;
    const sanitizedUnit = unit && unit.trim() !== '' ? unit : 'PCS';
    const sanitizedStatus = (status && ['active', 'inactive'].includes(status)) ? status : 'active';

    const result = await pool.query(
      `INSERT INTO products (name, barcode, category, price, tax_percent, stock_qty, unit, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, barcode, sanitizedCategory, price, sanitizedTaxPercent, sanitizedStockQty, sanitizedUnit, sanitizedStatus]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false,
        message: 'SKU/Barcode already exists' 
      });
    }
    res.status(500).json({ 
      success: false,
      message: 'Server error', 
      error: error.message 
    });
  }
};

// Update product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, barcode, category, price, tax_percent, stock_qty, unit, status } = req.body;

    // Validate barcode uniqueness if provided (excluding current product)
    if (barcode) {
      const existingProduct = await pool.query(
        'SELECT id FROM products WHERE barcode = $1 AND id != $2',
        [barcode, id]
      );
      
      if (existingProduct.rows.length > 0) {
        return res.status(400).json({ 
          success: false,
          message: `Product with SKU/Barcode "${barcode}" already exists` 
        });
      }
    }

    // Validate and sanitize inputs
    const sanitizedCategory = category && category.trim() !== '' ? category : null;
    const sanitizedTaxPercent = tax_percent && tax_percent !== '' ? parseFloat(tax_percent) : 0;
    const sanitizedStockQty = stock_qty && stock_qty !== '' ? parseInt(stock_qty) : 0;
    const sanitizedUnit = unit && unit.trim() !== '' ? unit : 'PCS';
    const sanitizedStatus = (status && ['active', 'inactive'].includes(status)) ? status : 'active';

    const result = await pool.query(
      `UPDATE products 
       SET name = $1, barcode = $2, category = $3, price = $4, tax_percent = $5, stock_qty = $6, unit = $7, status = $8
       WHERE id = $9 RETURNING *`,
      [name, barcode, sanitizedCategory, price, sanitizedTaxPercent, sanitizedStockQty, sanitizedUnit, sanitizedStatus, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: result.rows[0]
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === '23505') {
      return res.status(400).json({ 
        success: false,
        message: 'SKU/Barcode already exists' 
      });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Search products for POS
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;

    const result = await pool.query(
      `SELECT * FROM products 
       WHERE status = 'active' AND (name ILIKE $1 OR barcode ILIKE $1)
       LIMIT 20`,
      [`%${q}%`]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Import products from JSON array
exports.importProducts = async (req, res) => {
  try {
    const { products } = req.body;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ success: false, message: 'No products data provided' });
    }
    
    console.log(`Receiving ${products.length} products for import`);
    
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    const errors = [];
    const skipped = [];
    
    // Process each product
    for (let i = 0; i < products.length; i++) {
      const row = products[i];
      
      try {
        // Map Excel columns to database fields (flexible column names)
        const name = row['name'] || row['Product Name'] || row['Name'] || row['PRODUCT NAME'] || row['Product'];
        const barcode = row['barcode_category'] || row['barcode'] || row['SKU'] || row['Code'] || row['Barcode'] || row['SKU Code'] || row['BARCODE'] || `SKU-${Date.now()}-${i}`;
        const category = row['category'] || row['Category'] || row['CATEGORY'] || 'General';
        const price = parseFloat(row['price'] || row['Price'] || row['PRICE'] || row['Rate'] || 0);
        const stock_qty = parseInt(row['stock_quantity'] || row['stock_qty'] || row['Stock'] || row['Quantity'] || row['QTY'] || row['STOCK'] || 0);
        const tax_percent = parseFloat(row['tax_percent'] || row['Tax'] || row['TAX'] || row['Tax %'] || 0);
        const unit = row['unit'] || row['Unit'] || row['UNIT'] || 'PCS';
        
        if (!name || name.trim() === '') {
          errors.push(`Row ${i + 1}: Missing product name`);
          errorCount++;
          continue;
        }
        
        if (price < 0 || stock_qty < 0) {
          errors.push(`Row ${i + 1}: Invalid price or stock quantity`);
          errorCount++;
          continue;
        }
        
        // Check for duplicate SKU/Barcode
        const existingProduct = await pool.query(
          'SELECT id, name FROM products WHERE barcode = $1',
          [barcode]
        );
        
        if (existingProduct.rows.length > 0) {
          skipped.push(`Row ${i + 1}: SKU "${barcode}" already exists (Product: ${existingProduct.rows[0].name})`);
          skippedCount++;
          continue;
        }
        
        // Insert new product
        await pool.query(
          `INSERT INTO products (name, barcode, category, price, tax_percent, stock_qty, unit, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [name.trim(), barcode, category, price, tax_percent, stock_qty, unit, 'active']
        );
        
        successCount++;
        
      } catch (error) {
        console.error(`Row ${i + 1} error:`, error);
        errors.push(`Row ${i + 1}: ${error.message}`);
        errorCount++;
      }
    }
    
    res.json({
      success: true,
      message: `Import completed. ${successCount} products imported, ${skippedCount} skipped (duplicates), ${errorCount} errors.`,
      data: {
        successCount,
        skippedCount,
        errorCount,
        totalRows: products.length,
        errors: errors.slice(0, 10), // Return first 10 errors only
        skipped: skipped.slice(0, 10) // Return first 10 skipped items
      }
    });
    
  } catch (error) {
    console.error('Import products error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to import products', 
      error: error.message 
    });
  }
};
