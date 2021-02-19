const router = require('express').Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const userController = require('../controllers/user.controller');

router.get('/', isAuthenticated, userController.getAll);
router.get('/profile', isAuthenticated, userController.getProfile);

module.exports = router;
