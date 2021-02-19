const router = require('express').Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const questionController = require('../controllers/question.controller');

router.get(
  '/:questionId',
  isAuthenticated,
  questionController.getOneByQuestionId
);
router.post('/', isAuthenticated, questionController.insert);
router.put('/:questionId', isAuthenticated, questionController.edit);
router.delete('/:questionId', isAuthenticated, questionController.delete);

module.exports = router;
