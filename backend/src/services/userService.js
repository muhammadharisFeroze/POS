const pool = require('../config/database');
const bcrypt = require('bcryptjs');

class UserService {
  // Get all users
  static async getAllUsers() {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw new Error('Failed to fetch users');
    }
  }

  // Get user by ID
  static async getUserById(id) {
    try {
      const result = await pool.query(
        'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error('Failed to fetch user');
    }
  }

  // Create new user
  static async createUser(userData) {
    try {
      const { name, email, password, role } = userData;
      
      // Hash password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, role) 
         VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, created_at`,
        [name, email, hashedPassword, role]
      );
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw new Error('Failed to create user');
    }
  }

  // Update user
  static async updateUser(id, userData) {
    try {
      const { name, email, role } = userData;
      
      const result = await pool.query(
        `UPDATE users 
         SET name = $1, email = $2, role = $3 
         WHERE id = $4 RETURNING id, name, email, role, created_at`,
        [name, email, role, id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return result.rows[0];
    } catch (error) {
      if (error.code === '23505') {
        throw new Error('Email already exists');
      }
      throw error;
    }
  }

  // Delete user
  static async deleteUser(id) {
    try {
      // Prevent deleting the main admin user (id = 1)
      if (id === 1) {
        throw new Error('Cannot delete main admin user');
      }
      
      const result = await pool.query(
        'DELETE FROM users WHERE id = $1 RETURNING id',
        [id]
      );
      
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
      
      return { message: 'User deleted successfully' };
    } catch (error) {
      throw error;
    }
  }

  // Change user password
  static async changePassword(id, newPassword) {
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      await pool.query(
        'UPDATE users SET password_hash = $1 WHERE id = $2',
        [hashedPassword, id]
      );
      
      return { message: 'Password updated successfully' };
    } catch (error) {
      throw new Error('Failed to update password');
    }
  }
}

module.exports = UserService;