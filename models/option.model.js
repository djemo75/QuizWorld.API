const mysql = require('../database/config');
const mysqlLibrary = require('mysql');

class Option {
  constructor(option) {
    this.id = option.id;
    this.questionId = option.questionId;
    this.option = option.option;
    this.isRight = option.isRight;
  }
}

Option.bulkInsert = async (options, result) => {
  const connection = await mysql.connection();

  let sql = '';
  options.map((option) => {
    sql += mysqlLibrary.format('INSERT INTO options SET ?; ', [option]);
  });
  try {
    await connection.query('START TRANSACTION');
    await connection.query(sql);
    await connection.query('COMMIT');

    return result(null, { message: 'Added successfully!' });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Option.bulkEdit = async (options, result) => {
  const connection = await mysql.connection();

  let sql = '';
  options.map((option) => {
    sql += mysqlLibrary.format(
      'UPDATE options SET `option`=?, isRight=? WHERE id=?; ',
      [option.option, option.isRight, option.id]
    );
  });
  try {
    await connection.query('START TRANSACTION');
    await connection.query(sql);
    await connection.query('COMMIT');

    return result(null, { message: 'Edited successfully!' });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Option.bulkDelete = async (options, result) => {
  const connection = await mysql.connection();

  let sql = '';
  options.map((id) => {
    sql += mysqlLibrary.format('DELETE FROM options WHERE id=?; ', [id]);
  });
  try {
    await connection.query('START TRANSACTION');
    await connection.query(sql);
    await connection.query('COMMIT');

    return result(null, { message: 'Deleted successfully!' });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

module.exports = Option;
