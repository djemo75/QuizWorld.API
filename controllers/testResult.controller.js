const TestParticipant = require('../models/testParticipant.model');
const Test = require('../models/test.model');
const TestResult = require('../models/testResult.model');
const BaseError = require('../models/baseError.model');

exports.getAllByTestId = async (req, res, next) => {
  const { testId } = req.params;

  try {
    const params = {
      testId,
      searchString: req.query.searchString.replace(/'/g, "\\'"),
      pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
    };

    const test = await Test.getTestDetailsByTestId(testId);

    if (!test) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    const testResults = await TestResult.getAllByTestId(params);

    return res.send(testResults);
  } catch (error) {
    next(error);
  }
};

exports.getAllMyResults = async (req, res, next) => {
  const { userId } = req;

  try {
    const params = {
      userId,
      searchString: req.query.searchString.replace(/'/g, "\\'"),
      pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
    };

    const testResults = await TestResult.getAllMyResults(params);

    return res.send(testResults);
  } catch (error) {
    next(error);
  }
};

exports.getOne = async (req, res, next) => {
  const { testId, resultId } = req.params;

  try {
    const testResult = await TestResult.getOne(testId, resultId);

    if (!testResult) {
      throw new BaseError(`Not found Test result.`, 404);
    }

    return res.send(testResult);
  } catch (error) {
    next(error);
  }
};

exports.insert = async (req, res, next) => {
  const filledQuestions = req.body.data;
  const { testId } = req.params;
  const { userId } = req;

  try {
    if (
      !filledQuestions ||
      typeof filledQuestions !== 'object' ||
      !testId ||
      filledQuestions.some(({ id }) => !id)
    ) {
      throw new BaseError('Please provide test id and answers!', 400);
    }

    const newTestResult = new TestResult({
      testId,
      userId,
      createdAt: new Date(),
    });

    const insertedTestResult = await TestResult.insert(
      newTestResult,
      filledQuestions
    );

    return res.send(insertedTestResult);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  const { testId, resultId } = req.params;

  try {
    const dbResponse = await TestResult.delete(testId, resultId);

    if (dbResponse.affectedRows === 0) {
      throw new BaseError(`Not found Test result.`, 404);
    }

    return res.send({ message: 'Deleted successfully!' });
  } catch (error) {
    next(error);
  }
};
