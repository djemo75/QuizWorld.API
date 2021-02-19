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

module.exports = router;
