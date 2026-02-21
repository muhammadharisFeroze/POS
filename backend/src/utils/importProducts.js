/**
 * Import Products from Excel File
 * Usage: node src/utils/importProducts.js "path/to/excel/file.xlsx"
 */

const XLSX = require('xlsx');
const pool = require('../config/database');
require('dotenv').config();

async function importProductsFromExcel(filePath) {
  try {
    console.log('📁 Reading Excel file:', filePath);
    
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0]; // Get first sheet
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${data.length} rows in Excel file\n`);
    
    if (data.length === 0) {
      console.log('❌ No data found in Excel file');
      return;
    }
    
    // Show first row to understand structure
    console.log('📋 Excel columns:', Object.keys(data[0]));
    console.log('📝 Sample row:', data[0]);
    console.log('\n');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Insert products
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      try {
        // Map Excel columns to database fields
        // Adjust these column names based on your Excel file structure
        const name = row['Product Name'] || row['Name'] || row['PRODUCT NAME'] || row['name'];
        const barcode = row['SKU'] || row['Code'] || row['Barcode'] || row['SKU Code'] || `SKU-${i + 1}`;
        const category = row['Category'] || row['CATEGORY'] || 'General';
        const price = parseFloat(row['Price'] || row['PRICE'] || row['Rate'] || 0);
        const stock_qty = parseInt(row['Stock'] || row['Quantity'] || row['QTY'] || 0);
        const tax_percent = parseFloat(row['Tax'] || row['TAX'] || 0);
        
        if (!name) {
          console.log(`⚠️  Row ${i + 1}: Missing product name, skipping...`);
          errorCount++;
          continue;
        }
        
        // Insert into database
        const result = await pool.query(
          `INSERT INTO products (name, barcode, category, price, tax_percent, stock_qty, status) 
           VALUES ($1, $2, $3, $4, $5, $6, $7) 
           ON CONFLICT (barcode) DO UPDATE 
           SET name = $1, category = $3, price = $4, tax_percent = $5, stock_qty = $6
           RETURNING id`,
          [name, barcode, category, price, tax_percent, stock_qty, 'active']
        );
        
        successCount++;
        console.log(`✅ Row ${i + 1}: ${name} - Rs. ${price} (ID: ${result.rows[0].id})`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Row ${i + 1}: Error -`, error.message);
      }
    }
    
    console.log('\n═══════════════════════════════════════');
    console.log(`✅ Successfully imported: ${successCount} products`);
    console.log(`❌ Failed: ${errorCount} products`);
    console.log('═══════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error importing products:', error);
  } finally {
    await pool.end();
  }
}

// Get file path from command line argument
const filePath = process.argv[2];

if (!filePath) {
  console.log('❌ Please provide Excel file path');
  console.log('Usage: node src/utils/importProducts.js "path/to/file.xlsx"');
  process.exit(1);
}

importProductsFromExcel(filePath);
