# 💳 FinTrack — Full-Stack Expense Intelligence & Management

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

**FinTrack** is a full-stack, secure, responsive personal finance and expense management web application. Built with **React 19 (Vite)**, **Node.js/Express**, and **MongoDB**, it provides budget tracking, analytics, and data isolation.

---

## ✨ Features

- 🔐 **Secure JWT Authentication**: Register, login, token refresh, pre-save password hashing with `bcryptjs` (10 rounds).
- 🛡️ **User Data Isolation**: User queries and mutations strictly scoped to `req.user.id`.
- 💰 **Comprehensive Expense Tracking**:
  - Full CRUD operations with instant UI updates.
  - Multi-condition filters (Category, Payment Method, Date Ranges: Today, This Week, This Month, This Quarter, This Year, Custom).
  - Fuzzy text search across titles, descriptions, and categories.
  - One-click CSV Export with formatted metadata.
- 🎯 **Visual Budget Tracker**:
  - Dynamic monthly budget targets with percentage utilization gauge.
  - Visual status badges: Safe (`<80%`), Warning (`≥80%`), and Exceeded (`≥100%`).
  - Daily spending advisor based on remaining days in the month.
- 📊 **Analytics & Visual Reports**:
  - Category breakdown Doughnut chart with Chart.js.
  - Interactive KPI cards for Total Spend, Current Month, Highest Expense, and Average Transaction.
- 🏷️ **Category Management**:
  - Pre-seeded default categories (*Food, Travel, Shopping, Bills, Healthcare, Groceries, Rent, Education, Other*).
  - Custom category creator with color and icon support.
- 🌓 **Themes & Responsive UX**:
  - Glassmorphic dark and light theme toggle with local storage persistence.
  - Fully responsive mobile drawer and desktop sidebar.
  - Currency localized to Indian Rupee (₹ INR) format.

---

## 🏗️ Project Architecture

```text
expence_managment/
├── backend/
│   ├── config/             # Database connection (MongoDB + in-memory fallback)
│   ├── controllers/        # Request handlers (auth, expense, budget, category, report, profile)
│   ├── middleware/         # JWT authMiddleware, error handling
│   ├── models/             # Mongoose schemas (User, Expense, Budget, Category)
│   ├── routes/             # Express API routes
│   ├── .env.example        # Backend environment variables template
│   ├── package.json        # Backend dependencies
│   └── server.js           # Server entry point & static asset serving
├── frontend/
│   ├── public/             # Static public assets
│   ├── src/
│   │   ├── components/     # UI components (Layout, Navbar, Sidebar, Modals, KPICards)
│   │   ├── context/        # React Context (AuthContext, ThemeContext, ToastContext)
│   │   ├── pages/          # Dashboard, Expenses, Budget, Reports, Categories, Profile, Auth
│   │   ├── services/       # Axios API client with auto-auth interceptors
│   │   ├── App.jsx         # Routes & provider hierarchy
│   │   ├── index.css       # Global design system, glassmorphism, responsive utilities
│   │   └── main.jsx        # App entry point
│   ├── index.html          # SEO-ready HTML with fonts
│   ├── vite.config.js      # Vite config with API proxy
│   └── package.json        # Frontend dependencies
├── .gitignore              # Git ignore rules
├── LICENSE                 # MIT License
├── package.json            # Root scripts runner
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (v9 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI; automated in-memory MongoDB is built-in as a fallback)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/fintrack.git
cd fintrack
```

### 2. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```
*(Or run `npm install` inside both `backend/` and `frontend/` folders).*

### 3. Configure Environment Variables
Copy `.env.example` to `.env` in the `backend/` folder:
```bash
cp backend/.env.example backend/.env
```
Ensure the variables in `backend/.env` are configured:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/expense_management
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

### 4. Running the Application

#### Option A: Development Mode (Backend + Frontend with Hot Reload)
In two separate terminals:
```bash
# Terminal 1: Start backend
npm run server

# Terminal 2: Start frontend (Vite at http://localhost:5173)
npm run client
```

#### Option B: Production Mode (Unified Server)
```bash
# 1. Build the frontend production bundle
npm run build

# 2. Start the Express server (serves frontend on http://localhost:5000)
npm start
```

---

## 📡 API Reference

### Auth Routes (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user & seed categories | Public |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | Public |
| `GET` | `/api/auth/me` | Get current user profile | Private |

### Expense Routes (`/api/expenses`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/expenses` | List expenses (search, filter, sort) | Private |
| `POST` | `/api/expenses` | Add new expense | Private |
| `GET` | `/api/expenses/:id` | Get expense by ID | Private |
| `PUT` | `/api/expenses/:id` | Update expense record | Private |
| `DELETE` | `/api/expenses/:id` | Delete expense record | Private |

### Budget Routes (`/api/budget`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/budget?month=X&year=Y` | Get monthly budget & spend progress | Private |
| `POST` | `/api/budget` | Set or update monthly budget | Private |

### Report Routes (`/api/reports`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/reports/summary` | Get aggregated KPI cards metrics | Private |
| `GET` | `/api/reports/category` | Get category spending distribution | Private |

### Category Routes (`/api/categories`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/categories` | Get all user categories | Private |
| `POST` | `/api/categories` | Create custom category | Private |
| `PUT` | `/api/categories/:id` | Update custom category | Private |
| `DELETE` | `/api/categories/:id` | Delete custom category | Private |

### Profile Routes (`/api/profile`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/profile` | Get user profile metadata | Private |
| `PUT` | `/api/profile/update` | Update personal information | Private |
| `PUT` | `/api/profile/change-password`| Change user account password | Private |

---

## 🛡️ Security

- Passwords hashed with `bcryptjs`.
- Strict JWT middleware checks for every private route.
- Ownership checks on all write/delete operations.
- Security headers enforced via `helmet`.
- CORS configured for frontend communication.

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
