const pool = require('../config/database');

const checkTables = async () => {
  try {
    const result = await pool.query(`
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename
    `);

    console.log('\n📊 Database Tables Created:');
    console.log('================================');
    result.rows.forEach(row => {
      console.log(`✓ ${row.tablename}`);
    });
    console.log('================================\n');

    // Check discount table structure
    const discountSchema = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'discounts'
      ORDER BY ordinal_position
    `);

    if (discountSchema.rows.length > 0) {
      console.log('🎫 Discounts Table Structure:');
      console.log('================================');
      discountSchema.rows.forEach(col => {
        console.log(`- ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
      console.log('================================\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error checking tables:', error.message);
    process.exit(1);
  }
};

checkTables();
