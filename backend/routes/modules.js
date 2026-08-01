const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getModules,
  getModule,
  createModule,
  updateModule,
  deleteModule,
} = require('../controllers/moduleController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router
  .route('/')
  .get(getModules)
  .post(
    [body('moduleNumber').isNumeric().withMessage('Module number must be a number')],
    createModule
  );

router
  .route('/:id')
  .get(getModule)
  .put(updateModule)
  .delete(deleteModule);

module.exports = router;
