const mysql = require('../database/config');

class TestParticipant {
  constructor({ testId, userId, createdAt }) {
    this.testId = testId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}

TestParticipant.getAllByTestId = async (params, result) => {
  const connection = await mysql.connection();
  const {
    testId,
    searchString,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `users.username LIKE '%${searchString}%'`;
  }

  const sortingSql = `ORDER BY ${sortBy} ${sortDirection}`;

  try {
    const testsRows = await connection.query(
      `SELECT id FROM tests WHERE id=?`,
      [testId]
    );

    if (!testsRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const rows = await connection.query(
      `SELECT test_participants.id FROM test_participants
       INNER JOIN users ON test_participants.userId=users.id
       WHERE test_participants.testId=? ${searchSql && `AND ${searchSql}`}`,
      [testId]
    );
    const totalCount = rows.length;

    const participantsRows = await connection.query(
      `SELECT test_participants.*, users.username FROM test_participants
       INNER JOIN users ON test_participants.userId=users.id
       WHERE test_participants.testId=? ${
         searchSql && `AND ${searchSql}`
       } ${sortingSql} LIMIT ? OFFSET ?`,
      [testId, pageSize, pageNumber * pageSize]
    );

    const response = {
      participants: participantsRows,
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

TestParticipant.getByUserIdAndTestId = async ({ testId, userId }, result) => {
  const connection = await mysql.connection();

  try {
    const participantsRows = await connection.query(
      `SELECT * FROM test_participants WHERE testId=? AND userId=?`,
      [testId, userId]
    );

    if (!participantsRows.length) {
      return result(null, null);
    }

    return result(null, participantsRows[0]);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

TestParticipant.insert = async (newParticipant, result) => {
  const connection = await mysql.connection();

  try {
    const res = await connection.query(`INSERT INTO test_participants SET ?`, [
      newParticipant,
    ]);

    return result(null, { id: res.insertId, ...newParticipant });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

TestParticipant.delete = async (participantId, result) => {
  const connection = await mysql.connection();

  try {
    const res = await connection.query(
      `DELETE FROM test_participants WHERE id=?`,
      [participantId]
    );

    if (res.affectedRows === 0) {
      return result({ type: 'not_found' }, null);
    }

    return result(null, {
      message: 'The participant has been removed successfully!',
    });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

module.exports = TestParticipant;
