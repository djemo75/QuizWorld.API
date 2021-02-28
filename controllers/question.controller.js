const Test = require('../models/test.model');
const Question = require('../models/question.model');
const TestParticipant = require('../models/testParticipant.model');
const BaseError = require('../models/baseError.model');

exports.getQuestionsWithOptions = async (req, res, next) => {
  const { testId } = req.params;
  const { userId } = req;

  try {
    const currentTest = await Test.getByTestId(testId, userId);

    if (!currentTest) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    if (currentTest.visibility === 'private') {
      const participant = await TestParticipant.getByUserIdAndTestId(
        testId,
        userId
      );

      if (!participant) {
        throw new BaseError(
          'You are not included in the list of participants!',
          400
        );
      }
    }

    const questions = await Question.getQuestionsByTestId(testId);

    const response = questions.map((question) => ({
      ...question,
      options: question.options.map((option) => {
        const newOption = option;
        delete newOption.isRight;
        return newOption;
      }),
    }));

    return res.send(response);
  } catch (error) {
    next(error);
  }
};

exports.getQuestionsWithOptionsWithAnswers = async (req, res, next) => {
  const { testId } = req.params;
  const { userId } = req;

  try {
    const currentTest = await Test.getByTestId(testId, userId);

    if (!currentTest) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    const questions = await Question.getQuestionsByTestId(testId);

    const response = questions.map((question) => ({
      ...question,
      options: question.options.map((option) => ({
        ...option,
        isRight: Boolean(option.isRight),
      })),
    }));

    return res.send(response);
  } catch (error) {
    next(error);
  }
};

exports.getOneByQuestionId = async (req, res, next) => {
  const { questionId } = req.params;

  try {
    const question = await Question.getByQuestionId(questionId);

    if (!question) {
      throw new BaseError(`Not found Question with id ${questionId}.`, 404);
    }

    return res.send(question);
  } catch (error) {
    next(error);
  }
};

exports.insert = async (req, res) => {
  const { testId, question, image } = req.body;

  try {
    if (!testId) {
      throw new BaseError('Please provide test id for question!', 400);
    }

    if (!question) {
      throw new BaseError('Please provide content for question!', 400);
    }

    const newQuestion = new Question({
      testId,
      question,
      image,
      status: 1,
    });

    const insertedQuestion = await Question.insert(newQuestion);

    return res.send(insertedQuestion);
  } catch (error) {
    next(error);
  }
};

exports.edit = (req, res) => {
  const { questionId } = req.params;
  const { question, image } = req.body;

  if (!question) {
    return res.status(400).send('Please provide content for question!');
  }

  const newQuestion = new Question({ question, image });

  Question.edit(newQuestion, questionId, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found question with id ${questionId}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.delete = (req, res) => {
  const { questionId } = req.params;

  Question.delete(questionId, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found question with id ${questionId}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};
