# 💳 FinTrack — Full-Stack Expense Intelligence & Management

[![Live Demo](https://img.shields.io/badge/Demo-Live%20on%20Render-brightgreen?style=for-the-badge&logo=render)](https://fintrack-expense-management.onrender.com/login)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue?style=for-the-badge&logo=react)](https://react.dev)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express.js-Backend-black?style=for-the-badge&logo=express)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](./LICENSE)

---

## 🌐 Live Application

> **Production Deployment:**  
> 🔗 **[https://fintrack-expense-management.onrender.com/login](https://fintrack-expense-management.onrender.com/login)**

### ⚡ Quick Demo Access

You can test the app without signing up:

- Click the **"Instant Demo Account"** button on the login screen, or
- Sign in with demo credentials:
  - **Email**: `demo@fintrack.app`
  - **Password**: `demo1234`

_(Note: Render free tier services spin down on inactivity; if the site is cold, please allow 30–45 seconds for initial server spin-up)._

---

## 📖 Overview

**FinTrack** is a modern, responsive personal finance and expense management platform built on the **MERN** stack (React 19, Vite, Express, Node.js, and MongoDB). Designed with a glassmorphic aesthetic, it combines spending tracking, dynamic budget allocation, analytical visualizations, and multi-user data isolation.

---

## ✨ Key Features

- 🔐 **Secure JWT Authentication & Authorization**:
  - User registration, login, and profile management.
  - Safe password hashing with `bcryptjs` (10 salt rounds).
  - Axios interceptors with automatic bearer token injection and session expiration handling.
- 🛡️ **Strict Data Isolation**:
  - Every expense, budget target, and custom category is strictly scoped to `req.user.id`.
- 💰 **Comprehensive Expense Tracking**:
  - Full CRUD operations with instant UI updates.
  - Multi-condition filters: Category, Payment Method (Cash, UPI, Credit Card, Debit Card, Net Banking), and Date Ranges (_Today, This Week, This Month, This Quarter, This Year, Custom_).
  - Real-time search across titles, descriptions, and categories.
  - One-click CSV Export with formatted dates, amounts, and categories.
- 🎯 **Visual Budget Intelligence**:
  - Dynamic monthly budget target configuration.
  - Visual status progress gauge with color indicators: **Safe** (`<80%`), **Warning** (`≥80%`), and **Exceeded** (`≥100%`).
  - Intelligent daily spending advisor based on days remaining in the billing period.
- 📊 **Visual Analytics & KPI Insights**:
  - Category breakdown Doughnut charts powered by **Chart.js**.
  - At-a-glance KPI cards: Total Spent, Current Month Spending, Highest Expense, and Average Transaction Amount.
- 🏷️ **Custom Category Management**:
  - Pre-seeded essential categories (_Food, Travel, Shopping, Bills, Healthcare, Groceries, Rent, Education, Other_).
  - Ability to create custom categories with custom icons and color pickers.
- 🌓 **Glassmorphic UI & Responsive UX**:
  - Theme toggle (Dark / Light) with local storage persistence.
  - Indian Rupee (`₹` INR) currency localization.
  - Mobile drawer navigation and responsive desktop layout.

---

## 🛠️ Technology Stack

| Layer               | Technologies                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**        | React 19, Vite, React Router v7, Axios, Chart.js, React-ChartJS-2, Lucide Icons, Vanilla CSS (Design Tokens & Glassmorphism) |
| **Backend**         | Node.js, Express.js, Mongoose, JSON Web Tokens (JWT), BcryptJS, Helmet, CORS, Dotenv                                         |
| **Database**        | MongoDB (MongoDB Atlas in Production, In-Memory fallback for local testing)                                                  |
| **Hosting & CI/CD** | Render (Web Service: Unified Static Build + API Server)                                                                      |

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
│   ├── public/             # Static public assets & favicon
│   ├── src/
│   │   ├── components/     # UI components (Layout, Navbar, Sidebar, Modals, KPICards)
│   │   ├── context/        # React Context (AuthContext, ThemeContext, ToastContext)
│   │   ├── pages/          # Dashboard, Expenses, Budget, Reports, Categories, Profile, Auth
│   │   ├── services/       # Axios API client with auto-auth interceptors
│   │   ├── App.jsx         # App router & context providers
│   │   ├── index.css       # Global design system & glassmorphism variables
│   │   └── main.jsx        # Frontend entry point
│   ├── index.html          # HTML entry with custom typography
│   ├── vite.config.js      # Vite build configuration
│   └── package.json        # Frontend dependencies
├── .gitignore              # Git ignore configuration
├── LICENSE                 # MIT License
├── package.json            # Root unified build & start script
└── README.md               # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: Local MongoDB instance or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster

---

### 1. Clone the Repository

```bash
git clone https://github.com/YRMESHRAM/expence_managment.git
cd expence_managment
```

### 2. Install Dependencies

Install all workspace dependencies (root, backend, and frontend) in one command:

```bash
npm run install:all
```

---

### 3. Environment Variables

Create a `.env` file in the `backend/` directory by copying `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Populate the following variables in `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/expense_management?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=30d
NODE_ENV=development
```

---

### 4. Running Locally

#### Development Mode (Independent Frontend & Backend)

Run backend and frontend concurrently in two terminals:

```bash
# Terminal 1: Start backend with hot reload (http://localhost:5000)
npm run server

# Terminal 2: Start frontend Vite server (http://localhost:5173)
npm run client
```

#### Production Mode (Unified Server)

Test the production build served entirely by the Express backend:

```bash
# 1. Build backend dependencies and frontend distribution
npm run build

# 2. Launch production Express server
npm start
```

Visit `http://localhost:5000` in your browser.

---

## ☁️ Deployment on Render

This project is configured for single-service deployment on **Render**:

1. **Create Web Service**:
   - Link repository: `https://github.com/YRMESHRAM/expence_managment`
   - **Environment**: `Node`
2. **Build & Start Commands**:
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
3. **Environment Variables on Render**:
   - `NODE_ENV`: `production`
   - `PORT`: `10000` _(or default provided by Render)_
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `JWT_EXPIRE`: `30d`

---

## 📡 API Reference

### Authentication (`/api/auth`)

| Method | Endpoint             | Description                                 | Access  |
| ------ | -------------------- | ------------------------------------------- | ------- |
| `POST` | `/api/auth/register` | Register new user & seed default categories | Public  |
| `POST` | `/api/auth/login`    | Authenticate user & return JWT token        | Public  |
| `GET`  | `/api/auth/me`       | Fetch authenticated user data               | Private |

### Expenses (`/api/expenses`)

| Method   | Endpoint            | Description                                   | Access  |
| -------- | ------------------- | --------------------------------------------- | ------- |
| `GET`    | `/api/expenses`     | Query user expenses (search, category, range) | Private |
| `POST`   | `/api/expenses`     | Create a new expense record                   | Private |
| `GET`    | `/api/expenses/:id` | Fetch specific expense by ID                  | Private |
| `PUT`    | `/api/expenses/:id` | Update expense record                         | Private |
| `DELETE` | `/api/expenses/:id` | Delete expense record                         | Private |

### Budget (`/api/budget`)

| Method | Endpoint                     | Description                          | Access  |
| ------ | ---------------------------- | ------------------------------------ | ------- |
| `GET`  | `/api/budget?month=X&year=Y` | Get monthly budget target & progress | Private |
| `POST` | `/api/budget`                | Set or update monthly budget target  | Private |

### Reports & Analytics (`/api/reports`)

| Method | Endpoint                | Description                        | Access  |
| ------ | ----------------------- | ---------------------------------- | ------- |
| `GET`  | `/api/reports/summary`  | Get aggregated KPI cards metrics   | Private |
| `GET`  | `/api/reports/category` | Get spend distribution by category | Private |

### Categories (`/api/categories`)

| Method   | Endpoint              | Description                                | Access  |
| -------- | --------------------- | ------------------------------------------ | ------- |
| `GET`    | `/api/categories`     | Get all system & custom categories         | Private |
| `POST`   | `/api/categories`     | Create custom category (name, color, icon) | Private |
| `PUT`    | `/api/categories/:id` | Update custom category                     | Private |
| `DELETE` | `/api/categories/:id` | Delete custom category                     | Private |

### Profile (`/api/profile`)

| Method | Endpoint                       | Description                    | Access  |
| ------ | ------------------------------ | ------------------------------ | ------- |
| `GET`  | `/api/profile`                 | Retrieve user profile metadata | Private |
| `PUT`  | `/api/profile/update`          | Update name or account details | Private |
| `PUT`  | `/api/profile/change-password` | Update account password        | Private |

### Health Check (`/api/health`)

| Method | Endpoint      | Description                           | Access |
| ------ | ------------- | ------------------------------------- | ------ |
| `GET`  | `/api/health` | Check API server status and timestamp | Public |

---

## 🛡️ Security Best Practices

- **Bcrypt Password Hashing**: Passwords stored as 10-round salted hashes.
- **JWT Protection**: Protected routes guarded with Bearer token authentication.
- **Data Encapsulation**: Strict user ownership verification on all operations.
- **Helmet Middleware**: Configured Content Security Policy and HTTP security headers.
- **CORS Protection**: Controlled cross-origin access between frontend and API.

---
