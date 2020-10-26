const router = require('express').Router();
const connection = require('../database/config');
const authRoutes = require('./authRoutes');
const isAuthenticated = require('../middleware/isAuthenticated');

router.use('/auth', authRoutes);

router.get('/users', isAuthenticated, (req, res) => {
  connection.query('SELECT * FROM users', (err, rows, fields) => {
    if (err) throw err;

    if (rows) {
      const result = rows.map((x) => {
        return {
          id: x.id,
          username: x.username,
          rank: x.rank,
        };
      });

      res.send(result);
    } else {
      res.send([]);
    }
  });
});

module.exports = router;
