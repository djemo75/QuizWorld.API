const router = require('express').Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdminOrTestOwner = require('../middleware/isAdminOrTestOwner');
const testController = require('../controllers/test.controller');
const questionController = require('../controllers/question.controller');
const testParticipantController = require('../controllers/testParticipant.controller');

// Tests
router.get('/', isAuthenticated, testController.getAll);
router.post('/', isAuthenticated, testController.insert);
router.get('/getByJoinCode', isAuthenticated, testController.getOneByJoinCode);
router.get('/:testId', isAuthenticated, testController.getOneByTestId);
router.put(
  '/:testId',
  isAuthenticated,
  isAdminOrTestOwner,
  testController.edit
);
router.delete(
  '/:testId',
  isAuthenticated,
  isAdminOrTestOwner,
  testController.delete
);

// Questions
router.get(
  '/:testId/questionsWithOptions',
  isAuthenticated,
  questionController.getQuestionsWithOptions
);
router.get(
  '/:testId/questionsWithOptionsWithAnswers',
  isAuthenticated,
  isAdminOrTestOwner,
  questionController.getQuestionsWithOptionsWithAnswers
);

// Statistic
router.get(
  '/:testId/statistic',
  isAuthenticated,
  isAdminOrTestOwner,
  testController.getStatistic
);

// Participants
router.get(
  '/:testId/participants',
  isAuthenticated,
  isAdminOrTestOwner,
  testParticipantController.getAll
);
router.post(
  '/:testId/participants',
  isAuthenticated,
  isAdminOrTestOwner,
  testParticipantController.insert
);
router.delete(
  '/:testId/participants/:participantId',
  isAuthenticated,
  isAdminOrTestOwner,
  testParticipantController.delete
);

module.exports = router;
