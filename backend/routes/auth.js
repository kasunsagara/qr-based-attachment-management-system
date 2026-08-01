const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getMe, register } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/auth');

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  login
);

router.get('/me', protect, getMe);

router.post(
  '/register',
  protect,
  adminOnly,
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required')
      .isLength({ min: 3 })
      .withMessage('Username must be at least 3 characters'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
  ],
  register
);

module.exports = router;
