const BaseError = require('../models/baseError.model');
const Test = require('../models/test.model');

exports.getAll = async (req, res, next) => {
  const { testId } = req.params;
  const { userRole, userId } = req;

  try {
    const params = {
      testId,
      searchString: req.query.searchString.replace(/'/g, "\\'"),
      pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
      sortBy: req.query.sortBy ? req.query.sortBy : 'createdAt',
      sortDirection: req.query.sortDirection ? req.query.sortDirection : 'DESC',
    };

    const tests = await Test.getAll(params, userId, userRole);

    return res.send(tests);
  } catch (error) {
    next(error);
  }
};

exports.getOneByTestId = async (req, res, next) => {
  const { testId } = req.params;
  const { userId } = req;

  try {
    const test = await Test.getByTestId(testId, userId);

    if (!test) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    return res.send(test);
  } catch (error) {
    next(error);
  }
};

exports.getOneByJoinCode = async (req, res, next) => {
  const { joinCode } = req.query;

  try {
    const test = await Test.getByJoinCode(joinCode);

    if (!test) {
      throw new BaseError(`Not found Test with join code ${joinCode}.`, 404);
    }

    return res.send(test);
  } catch (error) {
    next(error);
  }
};

exports.insert = async (req, res, next) => {
  const { userId, name, description, duration, visibility } = req.body;

  try {
    if (!userId || !name || !visibility) {
      throw new BaseError('Please provide all required fields!', 500);
    }

    const joinCode = await Test.generateJoinCode();

    if (!joinCode) {
      throw new BaseError('Error when generating join code.');
    }

    const newTest = new Test({
      userId,
      name,
      description,
      duration,
      visibility,
      createdAt: new Date(),
      joinCode,
      status: 'unactive',
    });

    const insertedTest = Test.insert(newTest);

    return res.send(insertedTest);
  } catch (error) {
    next(error);
  }
};

exports.edit = async (req, res, next) => {
  const { testId } = req.params;
  const { name, description, duration, visibility, status } = req.body;

  try {
    if (!name || !visibility || !status) {
      throw new BaseError('Please provide all required fields!', 400);
    }

    const test = new Test({
      name,
      description,
      duration,
      visibility,
      status,
    });

    const dbResponse = await Test.edit(test, testId);

    if (dbResponse.affectedRows === 0) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    return res.send({ message: 'Edited successfully!' });
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  const { testId } = req.params;

  try {
    const dbResponse = await Test.delete(testId);

    if (dbResponse.affectedRows === 0) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    return res.send({ message: 'Deleted successfully!' });
  } catch (error) {
    next(error);
  }
};

exports.getStatistic = async (req, res, next) => {
  const { testId } = req.params;

  try {
    const statistic = await Test.getStatistic(testId);

    if (!statistic) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    return res.send(statistic);
  } catch (error) {
    next(error);
  }
};
