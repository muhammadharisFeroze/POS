const pool = require('../config/database');

class ProductService {
  // Get all products with filters
  static async getAllProducts(filters = {}) {
    try {
      const { search, status, page = 1, limit = 10, category } = filters;
      const offset = (page - 1) * limit;

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

      if (category) {
        params.push(category);
        query += ` AND category = $${params.length}`;
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(limit, offset);

      const result = await pool.query(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) FROM products WHERE 1=1';
      const countParams = [];
      
      if (search) {
        countParams.push(`%${search}%`);
        countQuery += ` AND (name ILIKE $${countParams.length} OR barcode ILIKE $${countParams.length})`;
      }
      
      if (status) {
        countParams.push(status);
        countQuery += ` AND status = $${countParams.length}`;
      }

      if (category) {
        countParams.push(category);
        countQuery += ` AND category = $${countParams.length}`;
      }

      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].count);

      return {
        products: result.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new Error('Failed to fetch products');
    }
  }

  // Get product by ID
  static async getProductById(id) {
    try {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
      
      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }
      
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create product
  static async createProduct(productData) {
    try {
      const { name, barcode, category, price, tax_percent, stock_qty, status } = productData;

      const result = await pool.query(
        `INSERT INTO products (name, barcode, category, price, tax_percent, stock_qty, status) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [name, barcode, category, price, tax_percent || 0, stock_qty || 0, status || 'active']
      );

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Barcode already exists');
      }
      throw new Error('Failed to create product');
    }
  }

  // Update product
  static async updateProduct(id, productData) {
    try {
      const { name, barcode, category, price, tax_percent, stock_qty, status } = productData;

      const result = await pool.query(
        `UPDATE products 
         SET name = $1, barcode = $2, category = $3, price = $4, tax_percent = $5, stock_qty = $6, status = $7
         WHERE id = $8 RETURNING *`,
        [name, barcode, category, price, tax_percent, stock_qty, status, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Barcode already exists');
      }
      throw error;
    }
  }

  // Delete product
  static async deleteProduct(id) {
    try {
      const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      return { message: 'Product deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete product');
    }
  }

  // Search products for POS
  static async searchProducts(query) {
    try {
      const result = await pool.query(
        `SELECT * FROM products 
         WHERE status = 'active' AND (name ILIKE $1 OR barcode ILIKE $1)
         LIMIT 20`,
        [`%${query}%`]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to search products');
    }
  }

  // Get low stock products
  static async getLowStockProducts(threshold = 10) {
    try {
      const result = await pool.query(
        `SELECT id, name, category, stock_qty, price 
         FROM products 
         WHERE status = 'active' AND stock_qty <= $1 
         ORDER BY stock_qty ASC`,
        [threshold]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch low stock products');
    }
  }

  // Update stock quantity
  static async updateStock(productId, quantityChange) {
    try {
      const result = await pool.query(
        `UPDATE products 
         SET stock_qty = stock_qty + $1 
         WHERE id = $2 RETURNING *`,
        [quantityChange, productId]
      );

      if (result.rows.length === 0) {
        throw new Error('Product not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ProductService;