const path = require('path');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const cookieParser = require('cookie-parser');

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
}

const passport = require('./config/passport');
const app = express();

// CORS configuration for Vercel deployments
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  // Allow any Vercel preview URL for this project
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);
      
      // Check if origin matches allowed origins or Vercel preview pattern
      if (allowedOrigins.includes(origin) || 
          (origin.includes('modern-ui-react') && origin.includes('vercel.app'))) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'fallback-secret-key-change-this-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://shivanshbhardwaj2015_db_user:bbbbbbbb@cluster0.zda2259.mongodb.net/';
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true);

// Connect to MongoDB (Vercel will reuse connections)
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Connect immediately
connectDB();

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/password-reset'));

const requireAuth = require('./middleware/auth');
app.use('/api/records', requireAuth, require('./routes/records'));
app.use('/api/analytics', requireAuth, require('./routes/analytics'));
app.use('/api/chat', requireAuth, require('./routes/chat'));
app.use(express.static(path.join(__dirname, '..', 'public')));

// For Vercel serverless, export the app
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // For local development, start the server
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}
