const pool = require('../config/database');

class DiscountService {
  // Get all discounts with product info
  static async getAllDiscounts(filters = {}) {
    try {
      const { active, productId } = filters;
      
      let query = `
        SELECT d.*, p.name as product_name, p.price as product_price
        FROM discounts d
        JOIN products p ON d.product_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (active !== undefined) {
        params.push(active);
        query += ` AND d.active = $${params.length}`;
      }

      if (productId) {
        params.push(productId);
        query += ` AND d.product_id = $${params.length}`;
      }

      query += ' ORDER BY d.created_at DESC';

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch discounts');
    }
  }

  // Get discount by ID
  static async getDiscountById(id) {
    try {
      const result = await pool.query(
        `SELECT d.*, p.name as product_name, p.price as product_price
         FROM discounts d
         JOIN products p ON d.product_id = p.id
         WHERE d.id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        throw new Error('Discount not found');
      }

      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Create discount
  static async createDiscount(discountData) {
    try {
      const { product_id, discount_percent, valid_from, valid_till, active = true } = discountData;

      // Validate date range
      if (new Date(valid_till) < new Date(valid_from)) {
        throw new Error('Valid till date must be after valid from date');
      }

      const result = await pool.query(
        `INSERT INTO discounts (product_id, discount_percent, valid_from, valid_till, active) 
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [product_id, discount_percent, valid_from, valid_till, active]
      );

      return result.rows[0];
    } catch (error) {
      if (error.message.includes('Valid till date')) {
        throw error;
      }
      throw new Error('Failed to create discount');
    }
  }

  // Update discount
  static async updateDiscount(id, discountData) {
    try {
      const { product_id, discount_percent, valid_from, valid_till, active } = discountData;

      // Validate date range if provided
      if (valid_from && valid_till && new Date(valid_till) < new Date(valid_from)) {
        throw new Error('Valid till date must be after valid from date');
      }

      const result = await pool.query(
        `UPDATE discounts 
         SET product_id = COALESCE($1, product_id),
             discount_percent = COALESCE($2, discount_percent),
             valid_from = COALESCE($3, valid_from),
             valid_till = COALESCE($4, valid_till),
             active = COALESCE($5, active),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6 RETURNING *`,
        [product_id, discount_percent, valid_from, valid_till, active, id]
      );

      if (result.rows.length === 0) {
        throw new Error('Discount not found');
      }

      return result.rows[0];
    } catch (error) {
      if (error.message.includes('Valid till date')) {
        throw error;
      }
      throw error;
    }
  }

  // Delete discount
  static async deleteDiscount(id) {
    try {
      const result = await pool.query('DELETE FROM discounts WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        throw new Error('Discount not found');
      }

      return { message: 'Discount deleted successfully' };
    } catch (error) {
      throw new Error('Failed to delete discount');
    }
  }

  // Get active discounts for a specific date
  static async getActiveDiscounts(date = new Date()) {
    try {
      const result = await pool.query(
        `SELECT d.*, p.name as product_name, p.price as product_price
         FROM discounts d
         JOIN products p ON d.product_id = p.id
         WHERE d.active = true 
           AND d.valid_from <= $1 
           AND d.valid_till >= $1
         ORDER BY d.created_at DESC`,
        [date.toISOString().split('T')[0]]
      );

      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch active discounts');
    }
  }

  // Get discount for specific product on a date
  static async getProductDiscount(productId, date = new Date()) {
    try {
      const result = await pool.query(
        `SELECT *
         FROM discounts
         WHERE product_id = $1
           AND active = true
           AND valid_from <= $2
           AND valid_till >= $2
         ORDER BY discount_percent DESC
         LIMIT 1`,
        [productId, date.toISOString().split('T')[0]]
      );

      return result.rows[0] || null;
    } catch (error) {
      throw new Error('Failed to fetch product discount');
    }
  }
}

module.exports = DiscountService;