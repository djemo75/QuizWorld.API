const TestParticipant = require('../models/testParticipant.model');
const Test = require('../models/test.model');
const TestResult = require('../models/testResult.model');

exports.getAllByTestId = (req, res) => {
  const { testId } = req.params;
  const params = {
    testId,
    searchString: req.query.searchString.replace(/'/g, "\\'"),
    pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
  };

  TestResult.getAllByTestId(params, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Test with id ${testId}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.getAllMyResults = (req, res) => {
  const { userId } = req;
  const params = {
    userId,
    searchString: req.query.searchString.replace(/'/g, "\\'"),
    pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
  };

  TestResult.getAllMyResults(params, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.getOne = (req, res) => {
  const { testId, resultId } = req.params;

  TestResult.getOne({ testId, resultId }, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Test result.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.insert = (req, res) => {
  const filledQuestions = req.body.data;
  const { testId } = req.params;
  const { userId } = req;

  if (
    !filledQuestions ||
    typeof filledQuestions !== 'object' ||
    !testId ||
    filledQuestions.some(({ id }) => !id)
  ) {
    return res.status(400).send('Please provide test id and answers!');
  }

  const newTestResult = new TestResult({
    testId,
    userId,
    createdAt: new Date(),
  });

  TestResult.insert(newTestResult, filledQuestions, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.delete = (req, res) => {
  const { testId, resultId } = req.params;

  TestResult.delete({ testId, resultId }, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Test result.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};
