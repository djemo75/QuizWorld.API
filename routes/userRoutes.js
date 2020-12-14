const router = require('express').Router();
const connection = require('../database/config');
const isAuthenticated = require('../middleware/isAuthenticated');
const extractSqlError = require('../utils/extractSqlError');

router.get('/', isAuthenticated, (req, res) => {
  let { pageSize, pageNumber, searchString, sortBy, sortDirection } = req.query;
  pageNumber = pageNumber ? parseInt(pageNumber - 1) : 0;
  pageSize = pageSize ? parseInt(pageSize) : 5;

  let searchSql = '';
  if (searchString) {
    searchSql = `WHERE username LIKE '%${searchString}%'`;
  }

  let sortSql = '';
  if (sortBy) {
    sortSql = `ORDER BY ${sortBy} ${sortDirection ? sortDirection : ''}`;
  }

  connection.query(`SELECT * FROM users ${searchSql}`, (countErr, rows) => {
    if (countErr) {
      return res.status(500).send(extractSqlError(countErr));
    }
    const totalCount = rows.length;

    connection.query(
      `SELECT * FROM users ${searchSql} ${sortSql} LIMIT ? OFFSET ?`,
      [pageSize, pageNumber * pageSize],
      (err, users) => {
        if (err) {
          return res.status(500).send(extractSqlError(err));
        }
        const result = {
          users: users.map((x) => {
            return {
              id: x.id,
              username: x.username,
              role: x.role,
            };
          }),
          pageNumber,
          pageSize,
          totalCount,
        };

        return res.send(result);
      }
    );
  });
});

router.get('/profile', isAuthenticated, (req, res) => {
  connection.query(
    'SELECT * FROM users WHERE id=?',
    [req.userId],
    (err, rows, fields) => {
      if (err) {
        return res.status(500).send(extractSqlError(err));
      }

      if (!rows.length) {
        return res.status(404).send('The token does not match any accounts');
      } else {
        const profile = rows[0];
        delete profile.password;
        return res.send(profile);
      }
    }
  );
});

module.exports = router;
