const User = require('../models/user.model');
const crypto = require('crypto-js');
const jwt = require('jsonwebtoken');
const BaseError = require('../models/baseError.model');

exports.getAll = async (req, res, next) => {
  try {
    const params = {
      searchString: req.query.searchString.replace(/'/g, "\\'"),
      pageNumber: req.query.pageNumber ? parseInt(req.query.pageNumber - 1) : 0,
      pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 5,
      sortBy: req.query.sortBy ? req.query.sortBy : 'id',
      sortDirection: req.query.sortDirection ? req.query.sortDirection : 'DESC',
    };

    const users = await User.getAll(params);

    return res.send(users);
  } catch (error) {
    next(error);
  }
};

exports.getProfile = async (req, res, next) => {
  const { userId } = req;

  try {
    const user = await User.getById(userId);
    if (!user) {
      throw new BaseError(`Not found User with id ${userId}.`, 404);
    }

    return res.send(user);
  } catch (error) {
    next(error);
  }
};

exports.registerUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.getByUsername(username);

    if (user) {
      throw new BaseError('There is user with this username!', 400);
    }

    const cryptedPassword = crypto.AES.encrypt(
      password,
      process.env.SECRET_KEY
    ).toString();

    const newUser = new User(username, cryptedPassword);

    const createdUser = await User.registerUser(newUser);
    return res.status(201).send(createdUser);
  } catch (error) {
    next(error);
  }
};

exports.loginUser = async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const user = await User.getFullInformationByUsername(username);
    if (!user) {
      throw new BaseError('There is no user with this username!', 400);
    }

    const decryptedPassword = crypto.AES.decrypt(
      user.password,
      process.env.SECRET_KEY
    ).toString(crypto.enc.Utf8);

    if (decryptedPassword !== password) {
      throw new BaseError('The password is wrong!', 400);
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
          throw new BaseError(err, 400);
        }

        const userObject = {
          message: 'User successfully logged in!',
          accessToken: token,
          userId: user.id,
        };
        return res.status(201).send(userObject);
      }
    );
  } catch (error) {
    next(error);
  }
};
