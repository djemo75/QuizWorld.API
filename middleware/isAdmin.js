const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    res.status(401).json({ message: 'Not authorized.' });
  } else {
    next();
  }
};

module.exports = isAdmin;
