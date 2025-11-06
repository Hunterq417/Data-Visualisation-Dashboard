# Data Visualization Dashboard

A modern full-stack data visualization dashboard with authentication, Google OAuth, and real-time analytics.

## ✨ Features

### Authentication
- 🔐 Email/Password registration and login
- 🔑 Google OAuth 2.0 sign-in
- 🍪 Secure session management with httpOnly cookies
- 🛡️ Protected API routes
- 🔒 Password hashing with scrypt

### Dashboard
- 📊 Real-time data visualization
- 📈 Interactive charts with Chart.js
- 🎨 Modern UI with dark/light theme toggle
- 📱 Fully responsive design
- 🔍 Filterable data API
- 📊 Statistics cards with live averages

## Stack

### Backend
- Node.js, Express
- MongoDB with Mongoose
- Passport.js (Google OAuth)
- Express Session
- CORS with credentials

### Frontend
- React 18 with Vite
- React Router for navigation
- Chart.js for visualizations
- Modern CSS with CSS variables

## 🚀 Quick Start

### Option 1: Automated Setup (Windows)
```powershell
.\install.ps1
```

### Option 2: Manual Setup

1. **Install Dependencies**
   ```bash
   cd server && npm install
   cd ../modern-ui-react && npm install
   ```

2. **Configure Environment**
   ```bash
   # Backend
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and Google OAuth credentials

   # Frontend
   cd ../modern-ui-react
   cp .env.example .env
   ```

3. **Seed Database**
   ```bash
   cd server
   npm run seed
   # Or with custom file: npm run seed -- C:\path\to\data.json
   ```

4. **Start Application**
   ```bash
   # Terminal 1 - Backend
   cd server
   npm start

   # Terminal 2 - Frontend
   cd modern-ui-react
   npm run dev
   ```

5. **Create Admin User**
   ```bash
   cd server
   npm run create-admin
   ```

6. **Open Browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3000
   - **Login with:** `admin` / `admin`

See [SETUP.md](./SETUP.md) for detailed instructions including Google OAuth setup.

## 🔑 API Endpoints

### Authentication (Public)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with credentials
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback

### Data (Protected)
- `GET /api/records` - Get records with optional filters
  - Query params: `page`, `limit`, `topic`, `sector`, `region`, `pestle`, `source`, `swot`, `country`, `city`, `end_year`, `year`
  - Range filters: `intensity_min`, `intensity_max`, `likelihood_min`, `likelihood_max`, `relevance_min`, `relevance_max`
- `GET /api/records/meta` - Get available filter values

## 📋 Data Fields

Each record contains:
- **Metrics**: intensity, likelihood, relevance
- **Time**: year, start_year, end_year, added, published
- **Location**: country, region, city
- **Categories**: topic, sector, pestle, source, swot
- **Content**: title, insight, url
