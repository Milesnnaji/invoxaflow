const puppeteer = require('puppeteer');

const formatCurrency = (amount, currency = 'NGN') => {
  const symbols = {
    NGN: '₦', USD: '$', GBP: '£', EUR: '€',
    KES: 'KSh', GHS: 'GH₵', ZAR: 'R'
  };
  const symbol = symbols[currency] || '₦';
  return `${symbol}${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
};

const getStatusColor = (status) => {
  const colors = {
    'Paid': '#10b981',
    'Unpaid': '#ef4444',
    'Pending': '#f59e0b',
    'Overdue': '#dc2626'
  };
  return colors[status] || '#6b7280';
};

const generateHTMLTemplate = (invoice, user) => {
  const itemsHTML = invoice.items && invoice.items.length > 0
    ? invoice.items.map(item => `
        <tr>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${item.description}</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; text-align: center;">${item.quantity}</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; text-align: right;">${formatCurrency(item.unitPrice, invoice.currency)}</td>
          <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155; text-align: right; font-weight: 600;">${formatCurrency(item.total, invoice.currency)}</td>
        </tr>
      `).join('')
    : `<tr>
        <td colspan="4" style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">${invoice.description}</td>
      </tr>`;

  const logoHTML = user.logo
    ? `<img src="${user.logo}" alt="Logo" style="height: 60px; max-width: 200px; object-fit: contain;" />`
    : `<div style="font-size: 28px; font-weight: 800; color: #0f172a; letter-spacing: -1px;">${user.businessName || user.name}</div>`;

  const subtotal = invoice.items && invoice.items.length > 0
    ? invoice.items.reduce((sum, item) => sum + item.total, 0)
    : invoice.amount;

  const taxAmount = invoice.tax ? (subtotal * invoice.tax / 100) : 0;
  const discountAmount = invoice.discount ? (subtotal * invoice.discount / 100) : 0;
  const total = subtotal + taxAmount - discountAmount;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceId}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #fff; color: #0f172a; }
    .page { max-width: 800px; margin: 0 auto; padding: 48px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px; padding-bottom: 32px; border-bottom: 3px solid #0f172a; }
    .invoice-badge { text-align: right; }
    .invoice-badge .title { font-size: 42px; font-weight: 900; color: #0f172a; letter-spacing: -2px; text-transform: uppercase; }
    .invoice-badge .id { font-size: 14px; color: #64748b; margin-top: 4px; font-family: monospace; }
    .parties { display: flex; justify-content: space-between; margin-bottom: 40px; gap: 32px; }
    .party-block { flex: 1; }
    .party-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 12px; }
    .party-name { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 6px; }
    .party-detail { font-size: 13px; color: #64748b; line-height: 1.6; }
    .meta-row { display: flex; gap: 32px; margin-bottom: 40px; }
    .meta-item { }
    .meta-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 6px; }
    .meta-value { font-size: 14px; font-weight: 600; color: #0f172a; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: white; background: ${getStatusColor(invoice.status)}; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
    thead tr { background: #0f172a; }
    thead th { padding: 14px 16px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #94a3b8; }
    thead th:not(:first-child) { text-align: center; }
    thead th:last-child { text-align: right; }
    .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
    .totals-box { min-width: 280px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 13px; color: #64748b; border-bottom: 1px solid #f1f5f9; }
    .totals-row.total { font-size: 18px; font-weight: 800; color: #0f172a; border-bottom: none; padding-top: 16px; }
    .notes { background: #f8fafc; border-left: 4px solid #0f172a; padding: 20px; border-radius: 0 8px 8px 0; margin-bottom: 40px; }
    .notes-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px; }
    .notes-text { font-size: 13px; color: #475569; line-height: 1.6; }
    .footer { text-align: center; padding-top: 32px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8; }
    .footer strong { color: #0f172a; }
    .accent-bar { height: 6px; background: linear-gradient(90deg, #0f172a, #3b82f6, #8b5cf6); margin-bottom: 0; border-radius: 3px 3px 0 0; }
  </style>
</head>
<body>
  <div class="accent-bar"></div>
  <div class="page">
    <div class="header">
      <div class="logo">
        ${logoHTML}
        <div style="font-size: 12px; color: #64748b; margin-top: 8px; line-height: 1.6;">
          ${user.businessAddress ? user.businessAddress + '<br/>' : ''}
          ${user.businessPhone ? user.businessPhone + '<br/>' : ''}
          ${user.email}
          ${user.website ? '<br/>' + user.website : ''}
        </div>
      </div>
      <div class="invoice-badge">
        <div class="title">Invoice</div>
        <div class="id">${invoice.invoiceId}</div>
        <div style="margin-top: 12px;"><span class="status-badge">${invoice.status}</span></div>
      </div>
    </div>

    <div class="meta-row">
      <div class="meta-item">
        <div class="meta-label">Issue Date</div>
        <div class="meta-value">${formatDate(invoice.createdAt)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Due Date</div>
        <div class="meta-value">${formatDate(invoice.dueDate)}</div>
      </div>
      <div class="meta-item">
        <div class="meta-label">Currency</div>
        <div class="meta-value">${invoice.currency || 'NGN'}</div>
      </div>
    </div>

    <div class="parties">
      <div class="party-block">
        <div class="party-label">Bill From</div>
        <div class="party-name">${user.businessName || user.name}</div>
        <div class="party-detail">${user.email}</div>
      </div>
      <div class="party-block">
        <div class="party-label">Bill To</div>
        <div class="party-name">${invoice.clientName}</div>
        <div class="party-detail">${invoice.clientEmail}</div>
        ${invoice.clientAddress ? `<div class="party-detail">${invoice.clientAddress}</div>` : ''}
        ${invoice.clientPhone ? `<div class="party-detail">${invoice.clientPhone}</div>` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th style="text-align:center;">Qty</th>
          <th style="text-align:right;">Unit Price</th>
          <th style="text-align:right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHTML}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-box">
        <div class="totals-row">
          <span>Subtotal</span>
          <span>${formatCurrency(subtotal, invoice.currency)}</span>
        </div>
        ${invoice.tax ? `<div class="totals-row"><span>Tax (${invoice.tax}%)</span><span>${formatCurrency(taxAmount, invoice.currency)}</span></div>` : ''}
        ${invoice.discount ? `<div class="totals-row"><span>Discount (${invoice.discount}%)</span><span>-${formatCurrency(discountAmount, invoice.currency)}</span></div>` : ''}
        <div class="totals-row total">
          <span>Total Due</span>
          <span>${formatCurrency(total, invoice.currency)}</span>
        </div>
      </div>
    </div>

    ${invoice.notes ? `
    <div class="notes">
      <div class="notes-label">Notes</div>
      <div class="notes-text">${invoice.notes}</div>
    </div>
    ` : ''}

    ${invoice.paymentReference ? `
    <div style="margin-bottom: 24px; padding: 16px; background: #f0fdf4; border-radius: 8px; border: 1px solid #bbf7d0;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #16a34a; margin-bottom: 6px;">Payment Reference</div>
      <div style="font-family: monospace; font-size: 13px; color: #166534;">${invoice.paymentReference}</div>
      ${invoice.paidAt ? `<div style="font-size: 12px; color: #15803d; margin-top: 4px;">Paid on ${formatDate(invoice.paidAt)}</div>` : ''}
    </div>
    ` : ''}

    ${user.emailSignature ? `
    <div style="margin-top: 24px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 13px; color: #64748b;">
      ${user.emailSignature}
    </div>
    ` : ''}

    <div class="footer">
      Generated by <strong>InvoxaFlow</strong> &bull; Thank you for your business!
    </div>
  </div>
</body>
</html>`;
};

const generateInvoicePDF = async (invoice, user) => {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    const htmlContent = generateHTMLTemplate(invoice, user);

    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0mm', right: '0mm', bottom: '20mm', left: '0mm' }
    });

    return pdfBuffer;
  } finally {
    if (browser) await browser.close();
  }
};

module.exports = { generateInvoicePDF };
