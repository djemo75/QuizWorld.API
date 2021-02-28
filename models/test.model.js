const mysql = require('../database/config');
const generateJoinCode = require('../utils/generateJoinCode');

class Test {
  constructor(test) {
    this.userId = test.userId;
    this.name = test.name;
    this.description = test.description;
    this.duration = test.duration;
    this.visibility = test.visibility;
    this.createdAt = test.createdAt;
    this.joinCode = test.joinCode;
    this.status = test.status;
  }
}

Test.getAll = async (params, userId, userRole) => {
  const connection = await mysql.connection();
  const { searchString, pageNumber, pageSize, sortBy, sortDirection } = params;

  const isAdmin = userRole === 'admin';
  let searchSql = isAdmin
    ? ''
    : `WHERE visibility='public' OR (visibility='private' AND userId='${userId}')`;
  if (searchString) {
    searchSql = isAdmin
      ? `WHERE name LIKE '%${searchString}%'`
      : `WHERE name LIKE '%${searchString}%' AND (visibility='public' OR (visibility='private' AND userId='${userId}'))`;
  }

  const sortingSql = `ORDER BY ${sortBy} ${sortDirection}`;

  const rows = await connection.query(`SELECT id FROM tests ${searchSql}`);
  const totalCount = rows.length;

  const tests = await connection.query(
    `SELECT id, name, visibility, duration, createdAt, status
       FROM tests ${searchSql} ${sortingSql} LIMIT ? OFFSET ?`,
    [pageSize, pageNumber * pageSize]
  );

  const response = {
    tests,
    pageNumber: pageNumber + 1,
    pageSize,
    totalCount,
  };

  await connection.release();
  return response;
};

Test.getByTestId = async (testId, userId) => {
  const connection = await mysql.connection();

  const testRows = await connection.query(
    `SELECT tests.*, users.username FROM tests LEFT JOIN users ON tests.userId=users.id WHERE tests.id=?`,
    [testId]
  );

  if (!testRows.length) {
    return null;
  }

  const test = testRows[0];

  let accessForSolving = true;
  if (test.visibility === 'private') {
    const participants = await connection.query(
      'SELECT * FROM test_participants WHERE testId=? AND userId=?',
      [testId, userId]
    );

    if (!participants.length) {
      accessForSolving = false;
    }
  }

  test.user = { id: test.userId, username: test.username };
  test.accessForSolving = accessForSolving;

  await connection.release();
  return test;
};

Test.getTestDetailsByTestId = async (testId) => {
  const connection = await mysql.connection();

  const testRows = await connection.query(`SELECT * FROM tests  WHERE id=?`, [
    testId,
  ]);

  await connection.release();
  return testRows.length ? testRows[0] : null;
};

Test.getByJoinCode = async (joinCode) => {
  const connection = await mysql.connection();

  const testsRows = await connection.query(
    `SELECT id FROM tests WHERE joinCode=?`,
    [joinCode]
  );

  await connection.release();
  return testsRows.length ? testsRows[0] : null;
};

Test.insert = async (newTest) => {
  const connection = await mysql.connection();

  const res = await connection.query(`INSERT INTO tests SET ?`, [newTest]);

  await connection.release();
  return { id: res.insertId, ...newTest };
};

Test.edit = async (test, testId) => {
  const connection = await mysql.connection();

  const res = await connection.query(
    `UPDATE tests SET name=?, description=?, duration=?, visibility=?, status=? WHERE id=?`,
    [
      test.name,
      test.description,
      test.duration,
      test.visibility,
      test.status,
      testId,
    ]
  );

  await connection.release();
  return res;
};

Test.delete = async (testId) => {
  const connection = await mysql.connection();

  const res = await connection.query(`DELETE FROM tests WHERE id=?`, [testId]);

  await connection.release();
  return res;
};

Test.generateJoinCode = async () => {
  const connection = await mysql.connection();

  let joinCode;
  while (true) {
    joinCode = generateJoinCode();
    const rows = await connection.query(
      `SELECT * FROM tests WHERE joinCode=?`,
      [joinCode]
    );
    if (!rows.length) {
      break;
    }
  }

  await connection.release();
  return joinCode;
};

Test.getStatistic = async (testId) => {
  const connection = await mysql.connection();

  const testsRows = await connection.query(`SELECT * FROM tests WHERE id=?`, [
    testId,
  ]);

  if (!testsRows.length) {
    return null;
  }

  const questionsRows = await connection.query(
    `SELECT * FROM questions WHERE testId=? AND status=1`,
    [testId]
  );

  const participantsRows = await connection.query(
    `SELECT * FROM test_participants WHERE testId=?`,
    [testId]
  );

  const resultsRows = await connection.query(
    `SELECT * FROM test_results WHERE testId=?`,
    [testId]
  );

  const statistic = {
    totalQuestions: questionsRows.length,
    totalParticipants: participantsRows.length,
    totalResults: resultsRows.length,
  };

  await connection.release();
  return statistic;
};

// Questions

Test.getQuestionsByTestId = async (testId, result) => {
  const connection = await mysql.connection();

  try {
    const questions = await connection.query(
      'SELECT id, testId, question, questionIndex FROM questions WHERE testId=? AND status=1 ORDER BY questionIndex ASC',
      [testId]
    );

    const questionsWithOptions = await Promise.all(
      questions.map(async (question) => {
        const options = await connection.query(
          'SELECT * FROM options WHERE questionId=?',
          [question.id]
        );
        return { ...question, options };
      })
    );

    return result(null, questionsWithOptions);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

module.exports = Test;
