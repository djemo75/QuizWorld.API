const mysql = require('../database/config');
const BaseError = require('./baseError.model');

class Question {
  constructor(question) {
    this.testId = question.testId;
    this.question = question.question;
    this.image = question.image;
    this.status = question.status;
    this.questionIndex = question.questionIndex;
  }
}

Question.getQuestionsByTestId = async (testId) => {
  const connection = await mysql.connection();

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

  await connection.release();
  return questionsWithOptions;
};

Question.getByQuestionId = async (questionId) => {
  const connection = await mysql.connection();

  const questionRows = await connection.query(
    'SELECT * FROM questions WHERE id=? AND status=1',
    [questionId]
  );

  await connection.release();
  return questionRows.length ? questionRows[0] : null;
};

Question.insert = async (newQuestion) => {
  const connection = await mysql.connection();
  const question = newQuestion;

  const lastQuestions = await connection.query(
    'SELECT questionIndex FROM questions WHERE testId=? AND questionIndex=(SELECT MAX(questionIndex) FROM questions WHERE testId=?)',
    [question.testId, question.testId]
  );

  question.questionIndex = lastQuestions.length
    ? Number(lastQuestions[0].questionIndex) + 1
    : 1;

  const res = await connection.query(`INSERT INTO questions SET ?`, [question]);

  await connection.release();
  return { questionId: res.insertId, ...question };
};

Question.edit = async (question, questionId, result) => {
  const connection = await mysql.connection();

  try {
    await connection.query('START TRANSACTION');
    const questionRows = await connection.query(
      `SELECT * FROM questions WHERE id=?`,
      [questionId]
    );

    if (!questionRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const currentQuestion = questionRows[0];
    let updatedQuestionId = questionId;
    if (currentQuestion.question !== question) {
      const usedQuestions = await connection.query(
        `SELECT * FROM questions_results WHERE questionId=?`,
        [questionId]
      );

      if (usedQuestions.length) {
        const editedQuestion = await connection.query(
          `INSERT INTO questions (testId, question, image, status, questionIndex) SELECT testId, ?, ?, 1, questionIndex FROM questions WHERE id=?`,
          [question.question, question.image, questionId]
        );

        await connection.query(`UPDATE questions SET status=0 WHERE id=?`, [
          questionId,
        ]);

        updatedQuestionId = editedQuestion.insertId;
      } else {
        await connection.query(
          `UPDATE questions SET question=?, image=? WHERE id=?`,
          [question.question, question.image, questionId]
        );
      }
    }

    await connection.query('COMMIT');
    return result(null, {
      message: 'Edited successfully!',
      questionId: updatedQuestionId,
    });
  } catch (err) {
    await connection.query('ROLLBACK');
    return result(err, null);
  } finally {
    await connection.release();
  }
};

Question.delete = async (questionId, result) => {
  const connection = await mysql.connection();

  try {
    const questionRows = await connection.query(
      `SELECT * FROM questions WHERE id=?`,
      [questionId]
    );

    if (!questionRows.length) {
      return result({ type: 'not_found' }, null);
    }

    const usedQuestions = await connection.query(
      `SELECT * FROM questions_results WHERE questionId=?`,
      [questionId]
    );
    if (usedQuestions.length) {
      await connection.query(`UPDATE questions SET status=0 WHERE id=?`, [
        questionId,
      ]);
    } else {
      await connection.query(`DELETE FROM questions WHERE id=?`, [questionId]);
    }

    return result(null, { message: 'Deleted successfully!' });
  } catch (err) {
    return result(err, null);
  } finally {
    await connection.release();
  }
};

module.exports = Question;
