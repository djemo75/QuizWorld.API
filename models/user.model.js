const mysql = require('../database/config');

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}

User.getAll = async (params, result) => {
  const connection = await mysql.connection();
  const { searchString, pageNumber, pageSize, sortBy, sortDirection } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `WHERE username LIKE '%${searchString}%'`;
  }

  const sortSql = `ORDER BY ${sortBy} ${sortDirection}`;

  try {
    const rows = await connection.query(`SELECT id FROM users ${searchSql}`);
    const totalCount = rows.length;

    const users = await connection.query(
      `SELECT id, username, role FROM users ${searchSql} ${sortSql} LIMIT ? OFFSET ?`,
      [pageSize, pageNumber * pageSize]
    );

    const response = {
      users,
      pageNumber: pageNumber + 1,
      pageSize,
      totalCount,
    };

    return result(null, response);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

User.getById = async (userId, result) => {
  const connection = await mysql.connection();

  try {
    const usersRows = await connection.query(
      `SELECT id, username, role, status FROM users WHERE id=?`,
      [userId]
    );

    if (!usersRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const user = usersRows[0];
    return result(null, user);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

User.getByUsername = async (username, result) => {
  const connection = await mysql.connection();

  try {
    const usersRows = await connection.query(
      `SELECT id, username, role, status FROM users WHERE username=?`,
      [username]
    );

    if (!usersRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const user = usersRows[0];
    return result(null, user);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

User.getFullInformationByUsername = async (username, result) => {
  const connection = await mysql.connection();

  try {
    const usersRows = await connection.query(
      `SELECT * FROM users WHERE username=?`,
      [username]
    );

    if (!usersRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const user = usersRows[0];
    return result(null, user);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

User.registerUser = async (newUser, result) => {
  const connection = await mysql.connection();

  try {
    const res = await connection.query(`INSERT INTO users SET ?`, [newUser]);

    return result(null, {
      message: 'Successfully registered!',
      id: res.insertId,
    });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

module.exports = User;
