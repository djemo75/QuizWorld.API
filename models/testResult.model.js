const mysql = require('../database/config');

class TestResult {
  constructor({ testId, userId, createdAt }) {
    this.testId = testId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}

TestResult.getAllByTestId = async (params, result) => {
  const connection = await mysql.connection();
  const { testId, searchString, pageNumber, pageSize } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `AND users.username LIKE '%${searchString}%'`;
  }

  try {
    const testsRows = await connection.query(
      `SELECT id FROM tests WHERE id=?`,
      [testId]
    );

    if (!testsRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const rows = await connection.query(
      `SELECT test_results.*, users.username FROM test_results
      left outer join users ON test_results.userId=users.id 
      WHERE test_results.testId=? ${searchSql}`,
      [testId]
    );
    const totalCount = rows.length;

    const results = await connection.query(
      `SELECT test_results.*, users.username FROM test_results
      left outer join users ON test_results.userId=users.id 
      WHERE test_results.testId=? ${searchSql} ORDER BY test_results.createdAt DESC LIMIT ? OFFSET ?`,
      [testId, pageSize, pageNumber * pageSize]
    );

    const resultsWithStatistics = await Promise.all(
      results.map(async (row) => {
        const questionBank = await connection.query(
          `SELECT questions_results.id, options.isRight  FROM questions
           left outer join questions_results ON questions.id=questions_results.questionId
           left outer join options ON questions_results.selectedOptionId=options.id
           WHERE questions.testId=? AND questions_results.testId=?`,
          [row.testId, row.id]
        );

        return {
          ...row,
          totalQuestions: questionBank.length,
          totalCorrectAnswers: questionBank.filter(({ isRight }) => isRight)
            .length,
        };
      })
    );

    const response = {
      results: resultsWithStatistics,
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

TestResult.getAllMyResults = async (params, result) => {
  const connection = await mysql.connection();
  const { userId, searchString, pageNumber, pageSize } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `AND tests.name LIKE '%${searchString}%'`;
  }

  try {
    const rows = await connection.query(
      `SELECT test_results.*, tests.name FROM test_results
      left outer join users ON test_results.userId=users.id 
      left outer join tests ON test_results.testId=tests.id 
      WHERE test_results.userId=? ${searchSql}`,
      [userId]
    );
    const totalCount = rows.length;

    const results = await connection.query(
      `SELECT test_results.*, tests.name FROM test_results
      left outer join users ON test_results.userId=users.id 
      left outer join tests ON test_results.testId=tests.id 
      WHERE test_results.userId=? ${searchSql} ORDER BY test_results.createdAt DESC LIMIT ? OFFSET ?`,
      [userId, pageSize, pageNumber * pageSize]
    );

    const resultsWithStatistics = await Promise.all(
      results.map(async (row) => {
        const questionBank = await connection.query(
          `SELECT questions_results.id, options.isRight  FROM questions
           left outer join questions_results ON questions.id=questions_results.questionId
           left outer join options ON questions_results.selectedOptionId=options.id
           WHERE questions.testId=? AND questions_results.testId=?`,
          [row.testId, row.id]
        );

        return {
          ...row,
          totalQuestions: questionBank.length,
          totalCorrectAnswers: questionBank.filter(({ isRight }) => isRight)
            .length,
        };
      })
    );

    const response = {
      results: resultsWithStatistics,
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

TestResult.getOne = async ({ testId, resultId }, result) => {
  const connection = await mysql.connection();

  try {
    const questions = await connection.query(
      `SELECT questions_results.*, questions.question, test_results.userId FROM questions_results 
      LEFT JOIN test_results ON questions_results.testId=test_results.id 
      LEFT JOIN questions ON questions_results.questionId=questions.id 
      WHERE test_results.testId=? AND test_results.id=?`,
      [testId, resultId]
    );

    if (!questions.length) {
      return result({ type: 'not_found' }, null);
    }

    const questionsWithOptions = await Promise.all(
      questions.map(async (row) => {
        const options = await connection.query(
          `SELECT * FROM options WHERE questionId=?`,
          [row.questionId]
        );

        return {
          ...row,
          options: options.map((option) => ({
            ...option,
            isRight: Boolean(option.isRight),
            selected: option.id === row.selectedOptionId ? true : false,
          })),
        };
      })
    );

    const userId = questions[0].userId;
    const userInfoRows = await connection.query(
      `SELECT * FROM users WHERE id=?`,
      [userId]
    );
    const userInfo = userInfoRows[0];

    const response = {
      result: questionsWithOptions,
      user: {
        id: userInfo.id,
        username: userInfo.username,
      },
    };

    return result(null, response);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

TestResult.insert = async (newTestResult, filledQuestions, result) => {
  const connection = await mysql.connection();

  try {
    await connection.query('START TRANSACTION');
    const insertedTest = await connection.query(
      `INSERT INTO test_results (userId, testId, createdAt) VALUES (?,?,?)`,
      [newTestResult.userId, newTestResult.testId, newTestResult.createdAt]
    );
    const insertedTestId = insertedTest.insertId;

    const payloadForInsert = filledQuestions.map((question) => [
      insertedTestId,
      question.id,
      question.selectedOptionId,
    ]);

    await connection.query(
      `INSERT INTO questions_results (testId, questionId, selectedOptionId) VALUES ?`,
      [payloadForInsert]
    );

    const questionBank = await connection.query(
      `SELECT questions_results.*, options.isRight  FROM questions
      left outer join questions_results ON questions.id=questions_results.questionId
      left outer join options ON questions_results.selectedOptionId=options.id
      WHERE questions.testId=? AND questions_results.testId=?`,
      [newTestResult.testId, insertedTestId]
    );

    const response = {
      totalQuestions: questionBank.length,
      totalCorrectAnswers: questionBank.filter(({ isRight }) => isRight).length,
    };
    await connection.query('COMMIT');

    return result(null, response);
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

TestResult.delete = async ({ testId, resultId }, result) => {
  const connection = await mysql.connection();

  try {
    const res = await connection.query(
      `DELETE FROM test_results WHERE id=? AND testId=?`,
      [resultId, testId]
    );

    if (res.affectedRows === 0) {
      return result({ type: 'not_found' }, null);
    }

    return result(null, { message: 'Deleted successfully!' });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

module.exports = TestResult;
