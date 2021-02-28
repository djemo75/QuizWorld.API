const TestParticipant = require('../models/testParticipant.model');
const User = require('../models/user.model');
const BaseError = require('../models/baseError.model');
const Test = require('../models/test.model');

exports.getAll = async (req, res, next) => {
  const { testId } = req.params;

  try {
    const params = {
      testId,
      searchString: req.query.searchString.replace(/'/g, "\\'"),
      pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
      sortBy: req.query.sortBy ? req.query.sortBy : 'createdAt',
      sortDirection: req.query.sortDirection ? req.query.sortDirection : 'DESC',
    };

    const test = await Test.getTestDetailsByTestId(testId);

    if (!test) {
      throw new BaseError(`Not found Test with id ${testId}.`, 404);
    }

    const participants = await TestParticipant.getAllByTestId(params);

    return res.send(participants);
  } catch (error) {
    next(error);
  }
};

exports.insert = async (req, res, next) => {
  const { testId } = req.params;
  const { username } = req.body;

  try {
    if (!username) {
      throw new BaseError('Please provide user for adding', 400);
    }

    const user = await User.getByUsername(username);
    if (!user) {
      throw new BaseError('Username does not exist', 404);
    }

    const userId = user.id;
    const participant = await TestParticipant.getByUserIdAndTestId(
      testId,
      userId
    );
    if (participant) {
      throw new BaseError(
        'The user is already participating in this test',
        400
      );
    }

    const newParticipant = new TestParticipant({
      testId,
      userId,
      createdAt: new Date(),
    });

    const data = await TestParticipant.insert(newParticipant);
    return res.send(data);
  } catch (error) {
    next(error);
  }
};

exports.delete = async (req, res, next) => {
  const { participantId } = req.params;

  try {
    const dbResponse = await TestParticipant.delete(participantId);

    if (dbResponse.affectedRows === 0) {
      throw new BaseError(
        `Not found Participant with id ${participantId}.`,
        404
      );
    }

    return res.send({
      message: 'The participant has been removed successfully!',
    });
  } catch (error) {
    next(error);
  }
};
