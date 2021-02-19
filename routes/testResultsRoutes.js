const router = require('express').Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdminOrTestOwner = require('../middleware/isAdminOrTestOwner');
const testResultController = require('../controllers/testResult.controller');

router.get('/me', isAuthenticated, testResultController.getAllMyResults);
router.get(
  '/:testId',
  isAuthenticated,
  isAdminOrTestOwner,
  testResultController.getAllByTestId
);
router.get(
  '/:testId/result/:resultId',
  isAuthenticated,
  isAdminOrTestOwner,
  testResultController.getOne
);
router.post('/:testId', isAuthenticated, testResultController.insert);
router.delete(
  '/:testId/result/:resultId',
  isAuthenticated,
  isAdminOrTestOwner,
  testResultController.delete
);

module.exports = router;
