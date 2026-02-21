/**
 * Migration script to add unit column to products table
 * Run this ONCE to update your existing database
 */

const pool = require('../config/database');
require('dotenv').config();

async function addUnitColumn() {
  try {
    console.log('🔄 Adding unit column to products table...');
    
    // Add unit column
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN IF NOT EXISTS unit VARCHAR(20) DEFAULT 'PCS'
    `);
    
    console.log('✅ Successfully added unit column!');
    console.log('✅ Database schema updated');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addUnitColumn();
