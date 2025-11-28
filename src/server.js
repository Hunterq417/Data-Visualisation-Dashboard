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

// CORS configuration
// CORS configuration
const getAllowedOrigins = () => {
  const origins = [
    'http://localhost:5173',
    'http://localhost:5174'
  ];

  if (process.env.FRONTEND_URL) {
    // Add the frontend URL, stripping any trailing slash
    origins.push(process.env.FRONTEND_URL.replace(/\/$/, ''));
  }

  return origins;
};

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (mobile apps, Postman, etc)
      if (!origin) return callback(null, true);

      const allowedOrigins = getAllowedOrigins();

      // Check if origin matches allowed origins
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

const MongoStore = require('connect-mongo');

const MONGODB_URI = process.env.MONGODB_URI;
const PORT = process.env.PORT || 3000;

mongoose.set('strictQuery', true);

// Connect to MongoDB
let isConnected = false;

const connectDB = async () => {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
  }
};

// Connect immediately
connectDB();

// let sessionStore;
// try {
//   sessionStore = MongoStore.create({
//     mongoUrl: MONGODB_URI,
//     collectionName: 'sessions',
//     ttl: 14 * 24 * 60 * 60 // 14 days
//   });
// } catch (err) {
//   console.error('Failed to create MongoStore, falling back to MemoryStore:', err.message);
// }

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // store: sessionStore, // Using MemoryStore by default to avoid crash with invalid DB URI
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 14 // 14 days
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/auth', require('./routes/password-reset'));

const requireAuth = require('./middleware/auth');
app.use('/api/records', requireAuth, require('./routes/records'));
app.use('/api/analytics', requireAuth, require('./routes/analytics'));
app.use('/api/chat', requireAuth, require('./routes/chat'));
app.use(express.static(path.join(__dirname, '..', 'dist')));

// Export the app
module.exports = app;
// Start the server
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
