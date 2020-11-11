const router = require('express').Router();
const connection = require('../database/config');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, (req, res) => {
  connection.query('SELECT * FROM users', (err, rows, fields) => {
    if (err) throw err;

    const result = rows.map((x) => {
      return {
        id: x.id,
        username: x.username,
        role: x.role,
      };
    });

    res.send(result);
  });
});

router.get('/profile', isAuthenticated, (req, res) => {
  connection.query(
    'SELECT * FROM users WHERE id=?',
    [req.userId],
    (err, rows, fields) => {
      if (err) throw err;

      if (rows.length) {
        const profile = rows[0];
        delete profile.password;
        res.send(profile);
      } else {
        res.status(404).send('The token does not match any accounts');
      }
    }
  );
});

module.exports = router;
