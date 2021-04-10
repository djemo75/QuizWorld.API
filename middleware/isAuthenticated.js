const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const authHeaders = req.get('Authorization');
  if (!authHeaders) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const token = req.get('Authorization').split(' ')[1];

  const tokenData = jwt.decode(token);
  if (!tokenData) {
    return res.status(401).json({ message: 'Token is invalid.', error });
  }

  req.userId = tokenData.id;
  req.userRole = tokenData.role;
  next();
};

module.exports = isAuthenticated;
