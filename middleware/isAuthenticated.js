const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
  const authHeaders = req.get('Authorization');
  if (!authHeaders) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const token = req.get('Authorization').split(' ')[1];

  try {
    decodedToken = jwt.verify(
      token,
      process.env.SECRET_KEY,
      (err, accessRes) => {
        if (err) {
          throw err;
        }

        req.userId = accessRes.id;
        req.userRole = accessRes.role;
        next();
      }
    );
  } catch (error) {
    res.status(401).json({ message: 'Token is invalid.', error });
  }
};

module.exports = isAuthenticated;
