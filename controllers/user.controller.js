const User = require('../models/user.model');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');

exports.getAll = (req, res) => {
  const params = {
    searchString: req.query.searchString.replace(/'/g, "\\'"),
    pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
    sortBy: req.query.sortBy ? req.query.sortBy : 'id',
    sortDirection: req.query.sortDirection ? req.query.sortDirection : 'DESC',
  };

  User.getAll(params, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.getProfile = (req, res) => {
  const { userId } = req;

  User.getById(userId, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return res.status(404).send({
          message: `Not found User with id ${userId}.`,
        });
      }

      return res.status(500).send();
    }
    return res.send(data);
  });
};

exports.registerUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.getByUsername(username, (err, data) => {
    if (err) {
      if (err.type === 'not_found') {
        return null;
      }

      return res.status(500).send();
    }
    return data;
  });

  if (user) {
    return res.status(400).send('There is user with this username!');
  }

  const cryptedPassword = crypto.AES.encrypt(
    password,
    process.env.SECRET_KEY
  ).toString();

  const newUser = new User(username, cryptedPassword);

  await User.registerUser(newUser, (err, data) => {
    if (err) {
      return res.status(500).send();
    }
    return res.status(201).send(data);
  });
};

exports.loginUser = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.getFullInformationByUsername(
    username,
    (err, data) => {
      if (err) {
        if (err.type === 'not_found') {
          return null;
        }

        return res.status(500).send();
      }
      return data;
    }
  );

  if (!user) {
    return res.status(400).send('There is no user with this username!');
  }

  const decryptedPassword = crypto.AES.decrypt(
    user.password,
    process.env.SECRET_KEY
  ).toString(crypto.enc.Utf8);

  if (decryptedPassword !== password) {
    return res.status(400).send('The password is wrong!');
  }

  jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
      status: user.status,
    },
    process.env.SECRET_KEY,
    (err, token) => {
      if (err) {
        return res.status(400).send(err);
      }

      const userObject = {
        message: 'User successfully logged in!',
        accessToken: token,
        userId: user.id,
      };
      return res.status(201).send(userObject);
    }
  );
};
