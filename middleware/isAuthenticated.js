const isAuthenticated = (req, res, next) => {
  const authHeaders = req.get('Authorization');
  console.log(authHeaders);

  next();
};

module.exports = isAuthenticated;
