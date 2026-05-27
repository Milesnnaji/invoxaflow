const axios = require('axios');
const Invoice = require('../models/Invoice');

// ==================== PAYSTACK ====================

// @route   POST /api/payments/paystack/initialize
const initializePaystack = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findOne({ _id: invoiceId, userId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already paid.' });
    }

    const reference = `INV-PS-${invoice.invoiceId}-${Date.now()}`;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email: invoice.clientEmail,
        amount: Math.round(invoice.amount * 100), // kobo
        reference,
        currency: invoice.currency === 'NGN' ? 'NGN' : 'NGN',
        metadata: {
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceId,
          clientName: invoice.clientName
        },
        callback_url: `${process.env.CLIENT_URL}/invoices/${invoice._id}?payment=success`
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Save reference to invoice
    invoice.paymentReference = reference;
    invoice.paymentGateway = 'paystack';
    await invoice.save();

    res.json({
      success: true,
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
      accessCode: response.data.data.access_code
    });
  } catch (err) {
    console.error('Paystack init error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to initialize Paystack payment.'
    });
  }
};

// @route   POST /api/payments/paystack/verify
const verifyPaystack = async (req, res) => {
  try {
    const { reference } = req.body;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
        }
      }
    );

    const { status, metadata } = response.data.data;

    if (status === 'success') {
      const invoice = await Invoice.findById(metadata.invoiceId);
      if (invoice) {
        invoice.status = 'Paid';
        invoice.paymentReference = reference;
        invoice.paymentGateway = 'paystack';
        invoice.paidAt = new Date();
        await invoice.save();
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        invoice
      });
    }

    res.status(400).json({
      success: false,
      message: 'Payment verification failed. Transaction not successful.'
    });
  } catch (err) {
    console.error('Paystack verify error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to verify Paystack payment.'
    });
  }
};

// ==================== FLUTTERWAVE ====================

// @route   POST /api/payments/flutterwave/initialize
const initializeFlutterwave = async (req, res) => {
  try {
    const { invoiceId } = req.body;

    const invoice = await Invoice.findOne({ _id: invoiceId, userId: req.user._id });
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found.' });
    }

    if (invoice.status === 'Paid') {
      return res.status(400).json({ success: false, message: 'Invoice is already paid.' });
    }

    const txRef = `INV-FLW-${invoice.invoiceId}-${Date.now()}`;

    const response = await axios.post(
      'https://api.flutterwave.com/v3/payments',
      {
        tx_ref: txRef,
        amount: invoice.amount,
        currency: invoice.currency || 'NGN',
        redirect_url: `${process.env.CLIENT_URL}/invoices/${invoice._id}?payment=success`,
        customer: {
          email: invoice.clientEmail,
          name: invoice.clientName
        },
        meta: {
          invoiceId: invoice._id.toString(),
          invoiceNumber: invoice.invoiceId
        },
        customizations: {
          title: 'InvoxaFlow Payment',
          description: `Payment for invoice ${invoice.invoiceId}`,
          logo: ''
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    invoice.paymentReference = txRef;
    invoice.paymentGateway = 'flutterwave';
    await invoice.save();

    res.json({
      success: true,
      paymentLink: response.data.data.link,
      txRef
    });
  } catch (err) {
    console.error('Flutterwave init error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to initialize Flutterwave payment.'
    });
  }
};

// @route   POST /api/payments/flutterwave/verify
const verifyFlutterwave = async (req, res) => {
  try {
    const { transactionId, txRef } = req.body;

    let response;
    if (transactionId) {
      response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
          headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
        }
      );
    } else if (txRef) {
      response = await axios.get(
        `https://api.flutterwave.com/v3/transactions?tx_ref=${txRef}`,
        {
          headers: { Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}` }
        }
      );
    } else {
      return res.status(400).json({ success: false, message: 'Transaction ID or reference required.' });
    }

    const txData = transactionId ? response.data.data : response.data.data[0];

    if (txData && txData.status === 'successful') {
      const invoiceId = txData.meta?.invoiceId;
      const invoice = invoiceId ? await Invoice.findById(invoiceId) : null;

      if (invoice) {
        invoice.status = 'Paid';
        invoice.paymentReference = txRef || transactionId;
        invoice.paymentGateway = 'flutterwave';
        invoice.paidAt = new Date();
        await invoice.save();
      }

      return res.json({
        success: true,
        message: 'Payment verified successfully',
        invoice
      });
    }

    res.status(400).json({
      success: false,
      message: 'Payment verification failed.'
    });
  } catch (err) {
    console.error('Flutterwave verify error:', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.response?.data?.message || 'Failed to verify Flutterwave payment.'
    });
  }
};

module.exports = {
  initializePaystack,
  verifyPaystack,
  initializeFlutterwave,
  verifyFlutterwave
};
