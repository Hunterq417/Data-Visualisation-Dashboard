const express = require('express');
const passport = require('passport');
const { hash: hashPassword, verify: verifyPassword } = require('../lib/passwords');
const User = require('../models/User');


const router = express.Router();

const TOKEN_NAME = process.env.AUTH_TOKEN_NAME || 'auth_token';
const TOKEN_MAX_AGE = Number(process.env.AUTH_TOKEN_MAX_AGE || 1000 * 60 * 60 * 24 * 7);

function sanitize(user) {
  return { id: user._id, email: user.email, name: user.name, createdAt: user.createdAt };
}

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existing = await User.findOne({ email: String(email).toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await hashPassword(password);
    const user = await User.create({ email, name, passwordHash, provider: 'local' });

    req.session.userId = user._id;
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.status(201).json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const emailOrUsername = String(email).toLowerCase().trim();
    const user = await User.findOne({ email: emailOrUsername });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (user.provider !== 'local' || !user.passwordHash) {
      return res.status(401).json({ error: `This account uses ${user.provider} sign-in. Please use "Continue with Google".` });
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    req.session.userId = user._id;
    await new Promise((resolve, reject) => {
      req.session.save((err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Session destroy error:', err);
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

router.get('/me', async (req, res) => {
  try {
    const userId = req.session.userId;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/google', (req, res, next) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Google OAuth not configured - missing credentials');
    return res.status(500).json({ error: 'Google OAuth not configured on server' });
  }
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
});

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login?error=oauth_failed' }),
  async (req, res) => {
    try {
      req.session.userId = req.user._id;
      await new Promise((resolve, reject) => {
        req.session.save((err) => {
          if (err) return reject(err);
          resolve();
        });
      });
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(frontendUrl);
    } catch (err) {
      console.error('Google OAuth callback error:', err);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login?error=server_error`);
    }
  }
);

module.exports = router;
