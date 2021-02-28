const router = require('express').Router();
const authRoutes = require('./authRoutes');
const userRoutes = require('./userRoutes');
const testRoutes = require('./testRoutes');
const questionRoutes = require('./questionRoutes');
const optionRoutes = require('./optionRoutes');
const testResultsRoutes = require('./testResultsRoutes');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/tests', testRoutes);
router.use('/questions', questionRoutes);
router.use('/options', optionRoutes);
router.use('/testResults', testResultsRoutes);

// General error handling
router.use(function (error, req, res, next) {
  const status = error.statusCode || 500;
  const message = error.message;
  return res.status(status).json({ message: message });
});

module.exports = router;
