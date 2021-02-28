const mysql = require('../database/config');

class TestParticipant {
  constructor({ testId, userId, createdAt }) {
    this.testId = testId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}

TestParticipant.getAllByTestId = async (params) => {
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

  await connection.release();
  return response;
};

TestParticipant.getByUserIdAndTestId = async (testId, userId) => {
  const connection = await mysql.connection();

  const participantsRows = await connection.query(
    `SELECT * FROM test_participants WHERE testId=? AND userId=?`,
    [testId, userId]
  );

  await connection.release();
  return participantsRows.length ? participantsRows[0] : null;
};

TestParticipant.insert = async (newParticipant) => {
  const connection = await mysql.connection();

  const res = await connection.query(`INSERT INTO test_participants SET ?`, [
    newParticipant,
  ]);

  await connection.release();
  return { id: res.insertId, ...newParticipant };
};

TestParticipant.delete = async (participantId) => {
  const connection = await mysql.connection();

  const res = await connection.query(
    `DELETE FROM test_participants WHERE id=?`,
    [participantId]
  );

  await connection.release();
  return res;
};

module.exports = TestParticipant;
