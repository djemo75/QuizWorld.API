const mysql = require('mysql');
require('dotenv').config();

const dbConfig = {
  connectionLimit: 10,
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
};
const connection = mysql.createPool(dbConfig);

module.exports = connection;
