const Option = require('../models/option.model');

exports.bulkInsert = (req, res) => {
  const { options } = req.body;

  if (!options || !options.length) {
    return res.status(400).send('Please provide options!');
  }

  // Validate the array
  if (options.some((option) => !option.questionId)) {
    return res.status(400).send('Please provide question id for option!');
  }
  if (options.some((option) => !option.option)) {
    return res.status(400).send('Please provide content for option!');
  }

  const optionsArray = options.map((option) => new Option(option));

  Option.bulkInsert(optionsArray, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.bulkEdit = (req, res) => {
  const { options } = req.body;

  if (!options || !options.length) {
    return res.status(400).send('Please provide options!');
  }

  // Validate the array
  if (options.some((option) => !option.id)) {
    return res.status(400).send('Please provide id for option!');
  }
  if (options.some((option) => !option.option)) {
    return res.status(400).send('Please provide content for option!');
  }

  const optionsArray = options.map((option) => new Option(option));

  Option.bulkEdit(optionsArray, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.bulkDelete = (req, res) => {
  const { options } = req.body;

  if (!options || !options.length) {
    return res.status(400).send('Please provide options!');
  }

  // Validate the array
  if (options.some((optionId) => typeof optionId !== 'number')) {
    return res.status(400).send('Please provide id for option!');
  }

  Option.bulkDelete(options, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};
