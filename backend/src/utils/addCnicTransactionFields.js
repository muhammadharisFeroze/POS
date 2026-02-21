/**
 * Migration script to add CNIC and Transaction ID fields to sales table
 * Run this ONCE to update your existing database
 */

const pool = require('../config/database');
require('dotenv').config();

async function addCnicAndTransactionFields() {
  try {
    console.log('🔄 Adding CNIC and Transaction ID fields to sales table...');
    
    // Add cnic column
    await pool.query(`
      ALTER TABLE sales 
      ADD COLUMN IF NOT EXISTS cnic VARCHAR(15)
    `);
    
    // Add transaction_id column
    await pool.query(`
      ALTER TABLE sales 
      ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100)
    `);
    
    console.log('✅ Successfully added CNIC and Transaction ID fields!');
    console.log('✅ Database schema updated');
    
  } catch (error) {
    console.error('❌ Error updating database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

addCnicAndTransactionFields();
