const { getUserId, parseTokenFromReq } = require('../lib/sessions');

module.exports = function requireAuth(req, res, next) {
  const token = parseTokenFromReq(req);
  const userId = getUserId(token);
  if (userId) {
    req.userId = userId;
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
};
