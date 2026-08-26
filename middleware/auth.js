// Simple middleware helpers used across routes

function requireLogin(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/log-in');
}

function requireAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.is_admin) return next();
  res.status(403).send('Forbidden – Admins only.');
}

module.exports = { requireLogin, requireAdmin };
