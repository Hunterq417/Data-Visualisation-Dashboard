module.exports = function requireAuth(req, res, next) {
  // Bypass authentication for now
  req.userId = 'dummy-user-id';
  req.user = { _id: 'dummy-user-id', name: 'Demo User', email: 'demo@example.com' };
  return next();
};
