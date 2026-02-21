# POS System - Fiori Style

A modern Point of Sale (POS) system built with React, Node.js, PostgreSQL, and UI5 Web Components.

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- PostgreSQL (v14 or higher)
- npm or yarn

### Database Setup

1. Install PostgreSQL and create a database:
```sql
CREATE DATABASE pos_db;
```

2. Update database credentials in `backend/.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_db
DB_USER=postgres
DB_PASSWORD=your_password
```

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create tables and seed admin user:
```bash
npm run seed
```

4. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## 📝 Default Credentials

- **Email**: admin@pos.com
- **Password**: admin123

## 🎯 Features

### Phase 1 (Completed)
- ✅ Backend API with Express & PostgreSQL
- ✅ JWT Authentication
- ✅ Database schema (users, products, sales, sale_items)
- ✅ User authentication system
- ✅ Product CRUD operations
- ✅ Sales transaction logic
- ✅ Dashboard with metrics
- ✅ Frontend with UI5 Fiori components
- ✅ Login page
- ✅ Protected routes
- ✅ Main layout with Shell Bar & Side Navigation

### Phase 2 (In Progress)
- 🔄 POS Screen (product search, cart, calculations)
- 🔄 Product Management UI
- 🔄 Sales listing UI
- 🔄 Invoice generation & printing
- 🔄 Reports module

### Phase 3 (Pending)
- ⏳ Excel export functionality
- ⏳ User management UI
- ⏳ Advanced filtering & search
- ⏳ Stock alerts

## 📁 Project Structure

```
POS/
├── backend/
│   ├── src/
│   │   ├── config/          # Database configuration
│   │   ├── controllers/     # Business logic
│   │   ├── middleware/      # Auth & validation
│   │   ├── models/          # Database schema
│   │   ├── routes/          # API routes
│   │   ├── utils/           # Helper functions
│   │   └── app.js           # Main app file
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/      # Reusable components
    │   ├── layout/          # Layout components
    │   ├── pages/           # Page components
    │   ├── routes/          # Route configuration
    │   ├── services/        # API services
    │   ├── store/           # Zustand state management
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env
    └── package.json
```

## 🔧 Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcryptjs

### Frontend
- React 18
- Vite
- UI5 Web Components for React
- React Router
- Zustand (State Management)
- Axios

## 🎨 UI Design

The application follows SAP Fiori design principles:
- Clean, white background (#f5f6f7)
- SAP blue accent (#0a6ed1)
- Professional enterprise layout
- Structured table-based displays
- 8px grid spacing
- Business-focused UI

## 🔐 API Endpoints

### Authentication
- POST `/api/auth/login` - User login
- POST `/api/auth/register` - Register new user (admin only)

### Products
- GET `/api/products` - Get all products (with pagination)
- GET `/api/products/:id` - Get product by ID
- GET `/api/products/search?q=` - Search products
- POST `/api/products` - Create product (admin only)
- PUT `/api/products/:id` - Update product (admin only)
- DELETE `/api/products/:id` - Delete product (admin only)

### Sales
- POST `/api/sales` - Create sale
- GET `/api/sales` - Get all sales (with pagination)
- GET `/api/sales/:id` - Get sale by ID
- GET `/api/sales/dashboard` - Dashboard statistics
- GET `/api/sales/reports/daily` - Daily sales report
- GET `/api/sales/reports/product-wise` - Product-wise sales report
- GET `/api/sales/reports/tax` - Tax report

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Verify database credentials in `.env`
- Check if database `pos_db` exists

### Frontend Not Loading
- Clear browser cache
- Check if backend is running
- Verify API URL in `frontend/.env`

### Port Already in Use
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will prompt to use another port automatically

## 📞 Next Steps

To continue development:

1. **Complete POS Screen**: Build the main POS interface with product search and cart
2. **Product Management UI**: Create forms for adding/editing products
3. **Invoice Printing**: Implement 80mm receipt printing
4. **Reports UI**: Build report pages with charts and Excel export
5. **User Management**: Admin panel for managing users

## 💡 Notes

- The system uses JWT tokens stored in localStorage
- All monetary values are stored as DECIMAL(10, 2)
- Timestamps are stored in UTC
- Stock is automatically deducted on sale completion
- Transactions are wrapped in database transactions for data integrity
