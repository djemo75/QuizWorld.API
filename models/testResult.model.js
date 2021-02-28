const mysql = require('../database/config');

class TestResult {
  constructor({ testId, userId, createdAt }) {
    this.testId = testId;
    this.userId = userId;
    this.createdAt = createdAt;
  }
}

TestResult.getAllByTestId = async (params) => {
  const connection = await mysql.connection();
  const { testId, searchString, pageNumber, pageSize } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `AND users.username LIKE '%${searchString}%'`;
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

  await connection.release();
  return response;
};

TestResult.getAllMyResults = async (params) => {
  const connection = await mysql.connection();
  const { userId, searchString, pageNumber, pageSize } = params;

  let searchSql = '';
  if (searchString) {
    searchSql = `AND tests.name LIKE '%${searchString}%'`;
  }

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

  await connection.release();
  return response;
};

TestResult.getOne = async (testId, resultId) => {
  const connection = await mysql.connection();

  const questions = await connection.query(
    `SELECT questions_results.*, questions.question, test_results.userId FROM questions_results 
      LEFT JOIN test_results ON questions_results.testId=test_results.id 
      LEFT JOIN questions ON questions_results.questionId=questions.id 
      WHERE test_results.testId=? AND test_results.id=?`,
    [testId, resultId]
  );

  if (!questions.length) {
    return null;
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

  await connection.release();
  return response;
};

TestResult.insert = async (newTestResult, filledQuestions) => {
  const connection = await mysql.connection();

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

  await connection.release();
  return response;
};

TestResult.delete = async (testId, resultId) => {
  const connection = await mysql.connection();

  const res = await connection.query(
    `DELETE FROM test_results WHERE id=? AND testId=?`,
    [resultId, testId]
  );

  await connection.release();
  return res;
};

module.exports = TestResult;
