const crypto = require('crypto');

const store = new Map();

function now() { return Date.now(); }

function create(userId, maxAgeMs = 1000 * 60 * 60 * 24 * 7) {
  const token = crypto.randomBytes(32).toString('hex');
  store.set(token, { userId: String(userId), expiresAt: now() + maxAgeMs });
  return token;
}

function getUserId(token) {
  if (!token) return null;
  const rec = store.get(token);
  if (!rec) return null;
  if (rec.expiresAt < now()) { store.delete(token); return null; }
  return rec.userId;
}

function destroy(token) {
  if (token) store.delete(token);
}

function parseTokenFromReq(req, cookieName = process.env.AUTH_TOKEN_NAME || 'auth_token') {
  const auth = req.headers['authorization'];
  if (auth && typeof auth === 'string') {
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) return m[1];
  }
  const header = req.headers['cookie'];
  if (!header || typeof header !== 'string') return null;
  const parts = header.split(';').map(s => s.trim());
  for (const p of parts) {
    const idx = p.indexOf('=');
    if (idx > 0) {
      const k = decodeURIComponent(p.slice(0, idx));
      if (k === cookieName) return decodeURIComponent(p.slice(idx + 1));
    }
  }
  return null;
}

module.exports = { create, getUserId, destroy, parseTokenFromReq };
