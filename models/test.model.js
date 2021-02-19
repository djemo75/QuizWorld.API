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

Test.getAll = async (params, userId, userRole, result) => {
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

  try {
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

    return result(null, response);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.getByTestId = async ({ testId, userId }, result) => {
  const connection = await mysql.connection();

  try {
    const testRows = await connection.query(
      `SELECT tests.*, users.username FROM tests LEFT JOIN users ON tests.userId=users.id WHERE tests.id=?`,
      [testId]
    );

    if (!testRows.length) {
      return result({ type: 'not_found' }, null);
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

    return result(null, test);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.getByJoinCode = async (joinCode, result) => {
  const connection = await mysql.connection();

  try {
    const testsRows = await connection.query(
      `SELECT id FROM tests WHERE joinCode=?`,
      [joinCode]
    );

    if (!testsRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const test = testsRows[0];
    return result(null, test);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.insert = async (newTest, result) => {
  const connection = await mysql.connection();

  try {
    const res = await connection.query(`INSERT INTO tests SET ?`, [newTest]);

    return result(null, { id: res.insertId, ...newTest });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.edit = async (test, testId, result) => {
  const connection = await mysql.connection();

  try {
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

    if (res.affectedRows === 0) {
      return result({ type: 'not_found' }, null);
    }

    return result(null, { message: 'Edited successfully!' });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.delete = async (testId, result) => {
  const connection = await mysql.connection();

  try {
    const res = await connection.query(`DELETE FROM tests WHERE id=?`, [
      testId,
    ]);

    if (res.affectedRows === 0) {
      return result({ type: 'not_found' }, null);
    }

    return result(null, {
      message: 'Deleted successfully!',
    });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.generateJoinCode = async (result) => {
  const connection = await mysql.connection();

  try {
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

    return result(null, joinCode);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Test.getStatistic = async (testId, result) => {
  const connection = await mysql.connection();

  try {
    const testsRows = await connection.query(`SELECT * FROM tests WHERE id=?`, [
      testId,
    ]);

    if (!testsRows.length) {
      return result({ type: 'not_found' }, null);
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

    return result(null, statistic);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
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
