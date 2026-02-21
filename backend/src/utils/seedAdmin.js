const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const seedAdmin = async () => {
  try {
    // Check if admin exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', ['admin@pos.com']);
    
    if (existing.rows.length > 0) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin
    const password = 'admin123';
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)',
      ['Admin User', 'admin@pos.com', password_hash, 'admin']
    );

    console.log('✅ Admin user created successfully');
    console.log('   Email: admin@pos.com');
    console.log('   Password: admin123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
