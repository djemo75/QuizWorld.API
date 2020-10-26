const router = require('express').Router();
const connection = require('../database/config');

router.post('/register', (req, res) => {
  connection.query(
    `INSERT INTO users (username, password) VALUES (?, ?)`,
    [req.body.username, req.body.password],
    (err, rows, fields) => {
      if (err) {
        res.status(400).send({
          message: 'Something went wrong!',
        });
      } else {
        res.status(201).send({
          message: 'Successfully registered!',
        });
      }
    }
  );
});

module.exports = router;
