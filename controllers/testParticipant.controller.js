const TestParticipant = require('../models/testParticipant.model');
const User = require('../models/user.model');

exports.getAll = (req, res) => {
  const { testId } = req.params;
  const params = {
    testId,
    searchString: req.query.searchString.replace(/'/g, "\\'"),
    pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
    sortBy: req.query.sortBy ? req.query.sortBy : 'createdAt',
    sortDirection: req.query.sortDirection ? req.query.sortDirection : 'DESC',
  };

  TestParticipant.getAllByTestId(params, (err, data) => {
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

exports.insert = async (req, res) => {
  const { testId } = req.params;
  const { username } = req.body;

  if (!username) {
    return res.status(400).send({
      message: 'Please provide user for adding',
    });
  }

  const user = await User.getByUsername(username, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({ message: 'Username does not exist' });
      }

      return res.status(500).send();
    }
    return data;
  });

  if (user) {
    const userId = user.id;
    const participant = await TestParticipant.getByUserIdAndTestId(
      { userId, testId },
      (err, data) => {
        if (err) {
          return res.status(500).send();
        }
        return data;
      }
    );

    if (participant) {
      return res.status(400).send({
        message: 'The user is already participating in this test',
      });
    }

    const newParticipant = new TestParticipant({
      testId,
      userId,
      createdAt: new Date(),
    });

    TestParticipant.insert(newParticipant, (err, data) => {
      if (err) {
        return res.status(500).send();
      }
      return res.send(data);
    });
  }
};

exports.delete = (req, res) => {
  const { participantId } = req.params;

  TestParticipant.delete(participantId, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Participant with id ${participantId}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};
