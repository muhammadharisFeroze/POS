# Modern POS System

A complete, modern Point of Sale (POS) web application built with React, Node.js, Express, and PostgreSQL. Features a clean, minimalistic UI design with professional aesthetics.

![POS System](https://img.shields.io/badge/Status-Production%20Ready-green) ![React](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Requirements](#system-requirements)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [User Roles](#user-roles)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### Core Functionality
- **Dashboard**: Real-time sales overview, revenue tracking, and low stock alerts
- **Point of Sale (POS)**: Modern, intuitive interface for quick sales transactions
- **Product Management**: Complete CRUD operations for inventory
- **Sales History**: View and print past invoices
- **Reports**: Daily sales, product-wise sales, and tax reports
- **User Management**: Role-based access control (Admin/Cashier)

### Transaction Features
- ✅ Item-level discount support
- ✅ Invoice-level discount
- ✅ Tax calculation (5% default)
- ✅ Multiple payment methods (Cash/Card)
- ✅ Walk-in customer sales
- ✅ Invoice generation & printing
- ✅ Automatic inventory deduction

### UI/UX Features
- ✅ Clean, minimalistic design
- ✅ Modern sidebar navigation with emoji icons
- ✅ Responsive grid layout for products
- ✅ Real-time cart updates
- ✅ Smooth animations and transitions
- ✅ High contrast, accessible design
- ✅ Mobile-responsive interface

## 🛠 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite 7.3.1** - Build tool
- **UI5 Web Components for React** - Component library
- **React Router DOM v6** - Routing
- **Zustand** - State management
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 💻 System Requirements

- **Node.js**: v18 or higher
- **PostgreSQL**: v14 or higher
- **npm**: v9 or higher
- **Operating System**: Windows, macOS, or Linux

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/muhammadharisFeroze/POS.git
cd POS
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## ⚙️ Configuration

### Backend Configuration

1. **Database Setup**

Create a PostgreSQL database:

```sql
CREATE DATABASE pos_system;
```

2. **Environment Variables**

Create a `.env` file in the `backend` directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=pos_system
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

3. **Initialize Database**

The application will automatically create tables on first run. To seed admin user:

```bash
node src/utils/seedAdmin.js
```

Default admin credentials:
- Email: `admin@pos.com`
- Password: `admin123`

### Frontend Configuration

Create a `.env` file in the `frontend` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### Production Mode

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm run preview
```

## 📁 Project Structure

```
POS/
├── backend/
│   ├── node_modules/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL connection
│   │   ├── controllers/
│   │   │   ├── authController.js    # Authentication logic
│   │   │   ├── productController.js # Product CRUD
│   │   │   └── salesController.js   # Sales & reports
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT verification
│   │   ├── models/
│   │   │   └── schema.js            # Database schema
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── salesRoutes.js
│   │   ├── utils/
│   │   │   └── seedAdmin.js         # Admin user seeder
│   │   └── app.js                   # Express app setup
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── node_modules/
│   ├── public/
│   ├── src/
│   │   ├── assets/                  # Images, icons
│   │   ├── layout/
│   │   │   ├── AppShellBar.jsx      # Header component
│   │   │   ├── AppSideNavigation.jsx # Sidebar navigation
│   │   │   ├── AppSideNavigation.css
│   │   │   ├── MainLayout.jsx
│   │   │   └── MainLayout.css
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx        # Dashboard page
│   │   │   ├── Dashboard.css
│   │   │   ├── Login.jsx            # Login page
│   │   │   ├── Login.css
│   │   │   ├── POS.jsx              # Point of Sale
│   │   │   ├── POS.css
│   │   │   ├── Products.jsx         # Product management
│   │   │   ├── Products.css
│   │   │   ├── Sales.jsx            # Sales history
│   │   │   ├── Sales.css
│   │   │   ├── Reports.jsx          # Reports page
│   │   │   ├── Reports.css
│   │   │   ├── Users.jsx            # User management
│   │   │   └── Users.css
│   │   ├── routes/
│   │   │   └── index.jsx            # Route configuration
│   │   ├── services/
│   │   │   └── api.js               # API service layer
│   │   ├── store/
│   │   │   ├── authStore.js         # Auth state management
│   │   │   └── cartStore.js         # Cart state management
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env
│
├── README.md
└── SETUP.md
```

## 📡 API Documentation

### Authentication

**POST** `/api/auth/register`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "cashier"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "admin@pos.com",
  "password": "admin123"
}
```

### Products

**GET** `/api/products` - Get all products

**POST** `/api/products` - Create product
```json
{
  "name": "Product Name",
  "barcode": "1234567890",
  "price": 99.99,
  "tax_percent": 5,
  "stock_qty": 100
}
```

**PUT** `/api/products/:id` - Update product

**DELETE** `/api/products/:id` - Delete product

### Sales

**POST** `/api/sales` - Create sale
```json
{
  "customer_name": "Walk-in Customer",
  "payment_method": "cash",
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 99.99,
      "discount": 10,
      "tax_percent": 5
    }
  ],
  "invoice_discount": 0
}
```

**GET** `/api/sales` - Get all sales

**GET** `/api/sales/stats` - Get dashboard statistics

**GET** `/api/sales/reports/daily?start_date=2026-01-01&end_date=2026-01-31`

**GET** `/api/sales/reports/product-wise?start_date=2026-01-01&end_date=2026-01-31`

**GET** `/api/sales/reports/tax?start_date=2026-01-01&end_date=2026-01-31`

## 👥 User Roles

### Admin
- Full access to all features
- Product management (Create, Read, Update, Delete)
- User management
- View all reports
- Access POS, Sales, Dashboard

### Cashier
- Access POS for sales transactions
- View sales history
- View reports
- View dashboard
- **Cannot** manage products or users

## 📸 Screenshots

### Login Page
Clean authentication interface with email/password login.

### Dashboard
Real-time overview with:
- Today's sales revenue (PKR)
- Total transactions count
- Low stock alerts table

### POS Screen
Modern two-column layout:
- **Left**: Product grid with visual cards, search functionality
- **Right**: Cart with quantity controls, discount options, payment methods

### Product Management
Complete inventory control with:
- Add/Edit/Delete products
- Barcode management
- Stock tracking
- Price and tax configuration

### Sales History
- View all completed transactions
- Invoice details modal
- Print invoice functionality

### Reports
Three report types with date range filters:
- Daily Sales Report
- Product-wise Sales Report
- Tax Report

### User Management (Admin Only)
- Create new users
- Assign roles (Admin/Cashier)
- Delete users (except primary admin)

## 🎨 Design Principles

- **Minimalistic**: Clean white backgrounds, subtle borders
- **High Contrast**: Easy-to-read black text on white
- **Blue Accent**: Professional blue (#2563eb) for primary actions
- **Consistent**: Uniform spacing, typography, and component styling
- **Responsive**: Works on desktop, tablet, and mobile
- **Accessible**: Clear labels, proper color contrast

## 💰 Currency

The system uses **Pakistani Rupees (PKR)** as the default currency, displayed as **Rs.**

To change currency:
1. Update display format in all components
2. Adjust tax calculations if needed
3. Update database schema if storing currency type

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Protected API routes with middleware
- Role-based access control
- SQL injection prevention with parameterized queries
- CORS configuration for API security

## 🐛 Known Issues / Limitations

1. **Mock Data Mode**: Currently running with mock data (PostgreSQL not required for demo)
2. **Excel Export**: Export buttons are UI-only, need backend implementation
3. **Receipt Printer**: Print uses browser print, not thermal printer integration
4. **Offline Mode**: Requires internet connection

## 🚧 Future Enhancements

- [ ] Barcode scanner integration
- [ ] Customer management module
- [ ] Supplier management
- [ ] Purchase orders
- [ ] Advanced inventory tracking (batch, expiry dates)
- [ ] Multi-store support
- [ ] Email/SMS notifications
- [ ] Loyalty program
- [ ] Advanced analytics dashboard
- [ ] PWA for offline capability

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Muhammad Haris**
- GitHub: [@mharis161](https://github.com/mharis161)

## 🙏 Acknowledgments

- UI5 Web Components team for the component library
- React community for excellent documentation
- All contributors and testers

## 📞 Support

For support, email support@example.com or create an issue in the GitHub repository.

---

**Built with ❤️ using React and Node.js**
