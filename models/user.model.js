const mysql = require('../database/config');

class User {
  constructor(username, password) {
    this.username = username;
    this.password = password;
  }
}

User.getAll = async (params) => {
  const connection = await mysql.connection();
  const { searchString, pageNumber, pageSize, sortBy, sortDirection } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `WHERE username LIKE '%${searchString}%'`;
  }

  const sortSql = `ORDER BY ${sortBy} ${sortDirection}`;

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

  await connection.release();
  return response;
};

User.getById = async (userId) => {
  const connection = await mysql.connection();

  const usersRows = await connection.query(
    `SELECT id, username, role, status FROM users WHERE id=?`,
    [userId]
  );

  await connection.release();
  return usersRows.length ? usersRows[0] : null;
};

User.getByUsername = async (username) => {
  const connection = await mysql.connection();

  const usersRows = await connection.query(
    `SELECT * FROM users WHERE username=?`,
    [username]
  );

  await connection.release();
  return usersRows.length ? usersRows[0] : null;
};

User.getFullInformationByUsername = async (username) => {
  const connection = await mysql.connection();

  const usersRows = await connection.query(
    `SELECT * FROM users WHERE username=?`,
    [username]
  );

  await connection.release();
  return usersRows.length ? usersRows[0] : null;
};

User.registerUser = async (newUser) => {
  const connection = await mysql.connection();

  const res = await connection.query(`INSERT INTO users SET ?`, [newUser]);

  await connection.release();
  return {
    message: 'Successfully registered!',
    id: res.insertId,
  };
};

module.exports = User;
