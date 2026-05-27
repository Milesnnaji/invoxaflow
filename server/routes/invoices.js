const express = require('express');
const { body } = require('express-validator');
const {
  getInvoices,
  getStats,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadPDF,
  sendInvoice
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/stats', getStats);
router.get('/', getInvoices);
router.get('/:id', getInvoice);
router.get('/:id/pdf', downloadPDF);
router.post('/:id/send', sendInvoice);

router.post('/', [
  body('clientName').trim().notEmpty().withMessage('Client name is required'),
  body('clientEmail').isEmail().withMessage('Valid client email is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('amount').isNumeric().withMessage('Amount must be a number').custom(v => v >= 0),
  body('dueDate').isISO8601().withMessage('Valid due date is required')
], createInvoice);

router.put('/:id', [
  body('clientName').optional().trim().notEmpty(),
  body('clientEmail').optional().isEmail(),
  body('amount').optional().isNumeric().custom(v => v >= 0),
  body('dueDate').optional().isISO8601()
], updateInvoice);

router.delete('/:id', deleteInvoice);

module.exports = router;
