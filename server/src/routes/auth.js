const express = require('express');
const passport = require('passport');
const { hash: hashPassword, verify: verifyPassword } = require('../lib/passwords');
const User = require('../models/User');
const { create: createSession, getUserId, destroy: destroySession, parseTokenFromReq } = require('../lib/sessions');

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

    const token = createSession(user._id.toString(), TOKEN_MAX_AGE);
    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_MAX_AGE
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

    const token = createSession(user._id.toString(), TOKEN_MAX_AGE);
    res.cookie(TOKEN_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: TOKEN_MAX_AGE
    });
    res.json({ user: sanitize(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  const token = parseTokenFromReq(req, TOKEN_NAME);
  destroySession(token);
  res.clearCookie(TOKEN_NAME);
  res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = parseTokenFromReq(req, TOKEN_NAME);
    const userId = getUserId(token);
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
      const token = createSession(req.user._id.toString(), TOKEN_MAX_AGE);
      res.cookie(TOKEN_NAME, token, {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: TOKEN_MAX_AGE
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
