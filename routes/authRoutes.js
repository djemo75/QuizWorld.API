const router = require('express').Router();
const connection = require('../database/config');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  connection.query(
    `SELECT * FROM users WHERE username=?`,
    [req.body.username],
    (err, rows, fields) => {
      if (err) {
        res.status(500).send('Something went wrong!');
      } else {
        if (rows.length) {
          const user = rows[0];
          const decryptedPassword = crypto.AES.decrypt(
            user.password,
            process.env.SECRET_KEY
          ).toString(crypto.enc.Utf8);
          if (decryptedPassword === req.body.password) {
            if (user.status === 'block') {
              res.status(400).send('This account is blocked!');
            } else {
              const token = jwt.sign(
                {
                  id: user.id,
                  username: user.username,
                  role: user.role,
                  status: user.status,
                },
                process.env.SECRET_KEY,
                (err, token) => {
                  res.status(201).send({
                    message: 'User successfully logged in!',
                    accessToken: token,
                    userId: user.id,
                  });
                }
              );
            }
          } else {
            res.status(400).send('The password is wrong!');
          }
        } else {
          res.status(400).send('There is no user with this username!');
        }
      }
    }
  );
});

router.post(
  '/register',
  (req, res, next) => {
    connection.query(
      `SELECT * FROM users WHERE username=?`,
      [req.body.username],
      (err, rows, fields) => {
        if (err) {
          res.status(500).send('Something went wrong!');
        } else {
          if (rows.length) {
            res.status(400).send('There is user with this username!');
          } else {
            next();
          }
        }
      }
    );
  },
  (req, res) => {
    const cryptedPassword = crypto.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString();

    connection.query(
      `INSERT INTO users (username, password) VALUES (?, ?)`,
      [req.body.username, cryptedPassword],
      (err, rows, fields) => {
        if (err) {
          res.status(500).send('Something went wrong!');
        } else {
          res.status(201).send('Successfully registered!');
        }
      }
    );
  }
);

module.exports = router;
