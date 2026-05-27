const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

const formatCurrency = (amount, currency = 'NGN') => {
  const symbols = { NGN: '₦', USD: '$', GBP: '£', EUR: '€', KES: 'KSh', GHS: 'GH₵', ZAR: 'R' };
  const symbol = symbols[currency] || '₦';
  return `${symbol}${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' });
};

const getStatusColor = (status) => {
  const colors = { 'Paid': '#10b981', 'Unpaid': '#ef4444', 'Pending': '#f59e0b', 'Overdue': '#dc2626' };
  return colors[status] || '#6b7280';
};

const generateEmailHTML = (invoice, user) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Invoice ${invoice.invoiceId}</title>
</head>
<body style="margin: 0; padding: 0; background: #f1f5f9; font-family: 'Segoe UI', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%); border-radius: 16px 16px 0 0; padding: 40px; text-align: center;">
      <div style="font-size: 28px; font-weight: 900; color: white; letter-spacing: -1px;">
        ${user.businessName || user.name}
      </div>
      <div style="margin-top: 12px; display: inline-block; background: rgba(255,255,255,0.15); padding: 6px 20px; border-radius: 20px;">
        <span style="font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Invoice</span>
      </div>
    </div>

    <!-- Body -->
    <div style="background: white; padding: 40px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">

      <p style="font-size: 16px; color: #334155; margin-bottom: 8px;">
        Hello <strong>${invoice.clientName}</strong>,
      </p>
      <p style="font-size: 15px; color: #64748b; margin-bottom: 32px; line-height: 1.7;">
        Please find your invoice attached to this email. Here's a quick summary:
      </p>

      <!-- Invoice Card -->
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin-bottom: 32px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
          <div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 4px;">Invoice Number</div>
            <div style="font-size: 18px; font-weight: 700; color: #0f172a; font-family: monospace;">${invoice.invoiceId}</div>
          </div>
          <div style="background: ${getStatusColor(invoice.status)}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">
            ${invoice.status}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 4px;">Issue Date</div>
            <div style="font-size: 14px; color: #334155; font-weight: 600;">${formatDate(invoice.createdAt)}</div>
          </div>
          <div>
            <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 4px;">Due Date</div>
            <div style="font-size: 14px; color: #334155; font-weight: 600;">${formatDate(invoice.dueDate)}</div>
          </div>
        </div>

        <div style="padding: 16px; background: #0f172a; border-radius: 8px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 6px;">Amount Due</div>
          <div style="font-size: 32px; font-weight: 900; color: white; letter-spacing: -1px;">${formatCurrency(invoice.amount, invoice.currency)}</div>
        </div>
      </div>

      ${invoice.notes ? `
      <div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 32px;">
        <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #92400e; margin-bottom: 6px;">Notes</div>
        <div style="font-size: 14px; color: #78350f; line-height: 1.6;">${invoice.notes}</div>
      </div>
      ` : ''}

      <p style="font-size: 14px; color: #64748b; line-height: 1.7; margin-bottom: 8px;">
        The full invoice PDF is attached to this email. If you have any questions, feel free to reply.
      </p>

      ${user.emailSignature ? `
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #e2e8f0; font-size: 14px; color: #64748b; line-height: 1.6;">
        ${user.emailSignature}
      </div>
      ` : `
      <div style="margin-top: 24px; font-size: 14px; color: #64748b;">
        <strong style="color: #334155;">Regards,</strong><br/>
        ${user.businessName || user.name}<br/>
        ${user.email}
        ${user.businessPhone ? '<br/>' + user.businessPhone : ''}
      </div>
      `}
    </div>

    <!-- Footer -->
    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 16px 16px; padding: 20px; text-align: center;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">
        Powered by <strong style="color: #0f172a;">InvoxaFlow</strong> &bull; Professional Invoice Management
      </p>
    </div>

  </div>
</body>
</html>`;
};

const sendInvoiceEmail = async (invoice, user, pdfBuffer) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"${user.businessName || user.name}" <${process.env.EMAIL_USER}>`,
    to: invoice.clientEmail,
    subject: `Invoice ${invoice.invoiceId} from ${user.businessName || user.name}`,
    html: generateEmailHTML(invoice, user),
    attachments: [
      {
        filename: `${invoice.invoiceId}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ]
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendInvoiceEmail };
