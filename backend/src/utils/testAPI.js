const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const testAPIs = async () => {
  console.log('\n🧪 Testing Backend APIs\n');
  console.log('================================\n');

  try {
    // 1. Test Health Check
    console.log('1️⃣  Testing Health Check...');
    const health = await axios.get(`${BASE_URL}/health`);
    console.log('✅ Health Check:', health.data);
    console.log();

    // 2. Test Login
    console.log('2️⃣  Testing Login...');
    const login = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@pos.com',
      password: 'admin123'
    });
    console.log('✅ Login Success:', {
      user: login.data.user,
      token: login.data.token.substring(0, 20) + '...'
    });
    console.log();

    const token = login.data.token;

    // 3. Test Get All Users
    console.log('3️⃣  Testing Get Users...');
    const users = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Users Found:', users.data.data.length);
    console.log();

    // 4. Test Get Dashboard Stats
    console.log('4️⃣  Testing Dashboard Stats...');
    const dashboard = await axios.get(`${BASE_URL}/sales/dashboard`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Dashboard Stats:', dashboard.data.data);
    console.log();

    // 5. Test Get All Products
    console.log('5️⃣  Testing Get Products...');
    const products = await axios.get(`${BASE_URL}/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Products Found:', products.data.products.length);
    console.log();

    // 6. Test Get All Discounts
    console.log('6️⃣  Testing Get Discounts...');
    const discounts = await axios.get(`${BASE_URL}/discounts`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Discounts Found:', discounts.data.data.length);
    console.log();

    console.log('================================');
    console.log('✅ All API Tests Passed!');
    console.log('================================\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
    process.exit(1);
  }
};

testAPIs();
