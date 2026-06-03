# StockHub - Stock Management System (SMS)

A full-stack inventory management application for **StockHub Ltd**, built with the MERN stack.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Recharts, React Router
- **Backend:** Node.js, Express.js, MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **HTTP Client:** Axios

## Project Structure

```
├── backend-project/          # Express.js REST API
│   ├── config/               # MongoDB connection
│   ├── controllers/          # Route handlers
│   ├── database/             # Seed script
│   ├── middleware/           # Auth, validation, error handling
│   ├── models/               # Mongoose schemas
│   └── routes/               # API route definitions
├── frontend-project/         # React.js application
│   ├── src/
│   │   ├── api/              # Axios configuration
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # Auth context
│   │   ├── pages/            # Application pages
│   │   └── utils/            # Validation utilities
└── README.md
```

## Prerequisites

- Node.js (v16+)
- MongoDB (v5+)
- npm or yarn

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Install backend dependencies
cd backend-project
npm install

# Install frontend dependencies
cd ../frontend-project
npm install
```

### 2. Configure Environment Variables

Edit `backend-project/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/SMS
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=1d
```

### 3. Seed the Database

```bash
cd backend-project
npm run seed
```

This creates:
- Admin user: `admin` / `admin123`
- 3 warehouses
- 5 products
- 8 sample transactions

### 4. Start the Application

```bash
# Terminal 1 - Start backend
cd backend-project
npm run dev

# Terminal 2 - Start frontend
cd frontend-project
npm start
```

The backend runs on `http://localhost:5000` and frontend on `http://localhost:3000`.

### 5. Login

Use credentials: **admin** / **admin123**

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product |
| GET | `/api/products` | Get all products |
| GET | `/api/products/low-stock` | Get low stock products |
| GET | `/api/products/:id` | Get single product |
| PATCH | `/api/products/:id/stock` | Update stock quantity |

### Warehouses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/warehouses` | Create warehouse |
| GET | `/api/warehouses` | Get all warehouses |
| GET | `/api/warehouses/:id` | Get single warehouse |

### Transactions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/transactions` | Create transaction |
| GET | `/api/transactions` | Get all transactions |
| GET | `/api/transactions/:id` | Get single transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Reports
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/daily?date=YYYY-MM-DD` | Daily report |
| GET | `/api/reports/weekly?startDate=&endDate=` | Weekly report |
| GET | `/api/reports/monthly?month=&year=` | Monthly report |

## Features

- **Dashboard** - Summary cards, stock movement chart, low stock alerts, recent transactions
- **Products** - CRUD operations with warehouse assignment
- **Warehouses** - Manage storage locations
- **Transactions** - Stock In/Out with automatic inventory updates
- **Reports** - Daily, weekly, monthly analytics with charts
- **Authentication** - JWT-based secure access
- **Validation** - Full input validation on frontend and backend
- **Responsive** - Mobile, tablet, and desktop support
