const express = require('express');
const {
  initializePaystack,
  verifyPaystack,
  initializeFlutterwave,
  verifyFlutterwave
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

// Paystack
router.post('/paystack/initialize', initializePaystack);
router.post('/paystack/verify', verifyPaystack);

// Flutterwave
router.post('/flutterwave/initialize', initializeFlutterwave);
router.post('/flutterwave/verify', verifyFlutterwave);

module.exports = router;
