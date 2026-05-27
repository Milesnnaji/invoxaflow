const express = require('express');
const { body } = require('express-validator');
const { updateUser, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.put('/update', [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('businessName').optional().trim(),
  body('currency').optional().isIn(['NGN', 'USD', 'GBP', 'EUR', 'KES', 'GHS', 'ZAR'])
    .withMessage('Invalid currency')
], updateUser);

router.put('/change-password', changePassword);

module.exports = router;
