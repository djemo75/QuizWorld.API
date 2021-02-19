const Test = require('../models/test.model');

exports.getAll = (req, res) => {
  const { testId } = req.params;
  const { userRole, userId } = req;
  const params = {
    testId,
    searchString: req.query.searchString.replace(/'/g, "\\'"),
    pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
    sortBy: req.query.sortBy ? req.query.sortBy : 'createdAt',
    sortDirection: req.query.sortDirection ? req.query.sortDirection : 'DESC',
  };

  Test.getAll(params, userId, userRole, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.getOneByTestId = (req, res) => {
  const { testId } = req.params;
  const { userId } = req;

  Test.getByTestId({ testId, userId }, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Test with id ${joinCode}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.getOneByJoinCode = (req, res) => {
  const { joinCode } = req.query;

  Test.getByJoinCode(joinCode, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found Test with join code ${joinCode}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.insert = async (req, res) => {
  const { userId, name, description, duration, visibility } = req.body;
  if (!userId || !name || !visibility) {
    return res.status(400).send('Please provide all required fields!');
  }

  const joinCode = await Test.generateJoinCode((err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return data;
  });

  if (joinCode) {
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

    Test.insert(newTest, (err, data) => {
      if (err) {
        return res.status(500).send();
      }
      return res.send(data);
    });
  }
};

exports.edit = (req, res) => {
  const { testId } = req.params;
  const { name, description, duration, visibility, status } = req.body;
  if (!name || !visibility || !status) {
    return res.status(400).send('Please provide all required fields!');
  }

  const test = new Test({
    name,
    description,
    duration,
    visibility,
    status,
  });

  Test.edit(test, testId, (err, data) => {
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

exports.delete = (req, res) => {
  const { testId } = req.params;

  Test.delete(testId, (err, data) => {
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

exports.getStatistic = (req, res) => {
  const { testId } = req.params;

  Test.getStatistic(testId, (err, data) => {
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
