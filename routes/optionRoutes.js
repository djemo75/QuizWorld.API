const router = require('express').Router();
const isAuthenticated = require('../middleware/isAuthenticated');
const optionController = require('../controllers/option.controller');

router.post('/bulk/add', isAuthenticated, optionController.bulkInsert);
router.put('/bulk/edit', isAuthenticated, optionController.bulkEdit);
router.delete('/bulk/delete', isAuthenticated, optionController.bulkDelete);

module.exports = router;
