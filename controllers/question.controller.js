const Test = require('../models/test.model');
const Question = require('../models/question.model');
const TestParticipant = require('../models/testParticipant.model');
const { options } = require('../routes/userRoutes');

exports.getQuestionsWithOptions = async (req, res) => {
  const { testId } = req.params;
  const { userId } = req;

  const currentTest = await Test.getByTestId(
    { testId, userId },
    (err, data) => {
      if (err) {
        if (err.type === 'not_found') {
          return res.status(404).send({
            message: `Not found Test with id ${testId}.`,
          });
        }

        return res.status(500).send();
      }
      return data;
    }
  );

  if (currentTest) {
    if (currentTest.visibility === 'private') {
      const participant = await TestParticipant.getByUserIdAndTestId(
        { userId, testId },
        (err, data) => {
          if (err) {
            return res.status(500).send();
          }
          return data;
        }
      );

      if (!participant) {
        return res
          .status(400)
          .send('You are not included in the list of participants!');
      }
    }

    await Question.getQuestionsByTestId(testId, (err, data) => {
      if (err) {
        return res.status(500).send();
      }

      const response = data.map((question) => ({
        ...question,
        options: question.options.map((option) => {
          const newOption = option;
          delete newOption.isRight;
          return newOption;
        }),
      }));

      return res.send(response);
    });
  }
};

exports.getQuestionsWithOptionsWithAnswers = async (req, res) => {
  const { testId } = req.params;
  const { userId } = req;

  const currentTest = await Test.getByTestId(
    { testId, userId },
    (err, data) => {
      if (err) {
        if (err.type === 'not_found') {
          return res.status(404).send({
            message: `Not found Test with id ${joinCode}.`,
          });
        }

        return res.status(500).send();
      }
      return data;
    }
  );

  if (currentTest) {
    await Question.getQuestionsByTestId(testId, (err, data) => {
      if (err) {
        return res.status(500).send();
      }
      const response = data.map((question) => ({
        ...question,
        options: question.options.map((option) => ({
          ...option,
          isRight: Boolean(option.isRight),
        })),
      }));
      return res.send(response);
    });
  }
};

exports.getOneByQuestionId = (req, res) => {
  const { questionId } = req.params;

  Question.getByQuestionId(questionId, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Question with id ${questionId}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.insert = async (req, res) => {
  const { testId, question, image } = req.body;

  if (!testId) {
    return res.status(400).send('Please provide test id for question!');
  }

  if (!question) {
    return res.status(400).send('Please provide content for question!');
  }

  const newQuestion = new Question({
    testId,
    question,
    image,
    status: 1,
  });

  Question.insert(newQuestion, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
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
