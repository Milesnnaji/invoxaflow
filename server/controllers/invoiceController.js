const { validationResult } = require('express-validator');
const Invoice = require('../models/Invoice');
const User = require('../models/User');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const { sendInvoiceEmail } = require('../utils/emailSender');

// @route   GET /api/invoices
const getInvoices = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const query = { userId: req.user._id };

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { clientName: { $regex: search, $options: 'i' } },
        { clientEmail: { $regex: search, $options: 'i' } },
        { invoiceId: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .lean();

    res.json({
      success: true,
      invoices,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get invoices error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoices.' });
  }
};

// @route   GET /api/invoices/stats
const getStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [total, paid, unpaid, pending, overdue, revenueResult] = await Promise.all([
      Invoice.countDocuments({ userId }),
      Invoice.countDocuments({ userId, status: 'Paid' }),
      Invoice.countDocuments({ userId, status: 'Unpaid' }),
      Invoice.countDocuments({ userId, status: 'Pending' }),
      Invoice.countDocuments({ userId, status: 'Overdue' }),
      Invoice.aggregate([
        { $match: { userId, status: 'Paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ])
    ]);

    const recent = await Invoice.find({ userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      stats: {
        total,
        paid,
        unpaid,
        pending,
        overdue,
        totalRevenue: revenueResult[0]?.total || 0
      },
      recentInvoices: recent
    });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch stats.' });
  }
};

// @route   GET /api/invoices/:id
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    res.json({ success: true, invoice });
  } catch (err) {
    console.error('Get invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch invoice.' });
  }
};

// @route   POST /api/invoices
const createInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      clientName, clientEmail, clientAddress, clientPhone,
      description, items, amount, tax, discount,
      dueDate, notes, currency
    } = req.body;

    const invoice = await Invoice.create({
      userId: req.user._id,
      clientName,
      clientEmail,
      clientAddress,
      clientPhone,
      description,
      items: items || [],
      amount,
      tax: tax || 0,
      discount: discount || 0,
      dueDate,
      notes,
      currency: currency || req.user.currency || 'NGN'
    });

    res.status(201).json({ success: true, message: 'Invoice created successfully', invoice });
  } catch (err) {
    console.error('Create invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to create invoice.' });
  }
};

// @route   PUT /api/invoices/:id
const updateInvoice = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const updates = req.body;
    Object.keys(updates).forEach(key => {
      if (key !== 'userId' && key !== '_id' && key !== 'invoiceId') {
        invoice[key] = updates[key];
      }
    });

    await invoice.save();

    res.json({ success: true, message: 'Invoice updated successfully', invoice });
  } catch (err) {
    console.error('Update invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to update invoice.' });
  }
};

// @route   DELETE /api/invoices/:id
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    res.json({ success: true, message: 'Invoice deleted successfully' });
  } catch (err) {
    console.error('Delete invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete invoice.' });
  }
};

// @route   GET /api/invoices/:id/pdf
const downloadPDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const user = await User.findById(req.user._id).lean();
    const pdfBuffer = await generateInvoicePDF(invoice, user);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${invoice.invoiceId}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('PDF generation error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate PDF.' });
  }
};

// @route   POST /api/invoices/:id/send
const sendInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, userId: req.user._id }).lean();

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    const user = await User.findById(req.user._id).lean();
    const pdfBuffer = await generateInvoicePDF(invoice, user);

    await sendInvoiceEmail(invoice, user, pdfBuffer);

    res.json({ success: true, message: `Invoice sent to ${invoice.clientEmail}` });
  } catch (err) {
    console.error('Send invoice error:', err);
    res.status(500).json({ success: false, message: 'Failed to send invoice email.' });
  }
};

module.exports = {
  getInvoices,
  getStats,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  downloadPDF,
  sendInvoice
};
