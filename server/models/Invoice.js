const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  }
}, { _id: true });

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  invoiceId: {
    type: String,
    unique: true,
    default: () => `INV-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`
  },
  clientName: {
    type: String,
    required: [true, 'Client name is required'],
    trim: true
  },
  clientEmail: {
    type: String,
    required: [true, 'Client email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  clientAddress: {
    type: String,
    trim: true,
    default: ''
  },
  clientPhone: {
    type: String,
    trim: true,
    default: ''
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  items: [invoiceItemSchema],
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  status: {
    type: String,
    enum: ['Paid', 'Unpaid', 'Pending', 'Overdue'],
    default: 'Unpaid'
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  paymentReference: {
    type: String,
    default: ''
  },
  paymentGateway: {
    type: String,
    enum: ['paystack', 'flutterwave', 'manual', ''],
    default: ''
  },
  paidAt: {
    type: Date
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  currency: {
    type: String,
    default: 'NGN'
  }
}, {
  timestamps: true
});

// Auto-mark overdue
invoiceSchema.pre('save', function(next) {
  if (this.status === 'Unpaid' && this.dueDate && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  next();
});

// Index for search
invoiceSchema.index({ clientName: 'text', clientEmail: 'text', invoiceId: 'text' });

module.exports = mongoose.model('Invoice', invoiceSchema);
