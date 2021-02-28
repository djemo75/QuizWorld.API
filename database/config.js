const mysql = require('mysql');
const util = require('util');
require('dotenv').config();

const dbConfig = {
  connectionLimit: 9,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  multipleStatements: true,
};
const pool = mysql.createPool(dbConfig);

const connection = () => {
  return new Promise((resolve, reject) => {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log('CONNECTION ERROR', err);
        reject(err);
      }
      console.log('MySQL pool connected: threadId ' + connection.threadId);
      const query = (sql, binding) => {
        return new Promise((resolve, reject) => {
          connection.query(sql, binding, (err, result) => {
            if (err) reject(err);
            resolve(result);
          });
        });
      };
      const release = () => {
        return new Promise((resolve, reject) => {
          if (err) reject(err);
          console.log('MySQL pool released: threadId ' + connection.threadId);
          resolve(connection.release());
        });
      };

      resolve({ query, release });
    });
  });
};

const query = (sql, binding) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, binding, (err, result, fields) => {
      if (err) reject(err);
      resolve(result);
    });
  });
};

module.exports = { connection, query, pool };
