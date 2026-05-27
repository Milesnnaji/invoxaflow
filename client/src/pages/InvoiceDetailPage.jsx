import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency, formatDate, formatDateFull, formatDateTime,
  copyToClipboard, getErrorMessage
} from '../utils/helpers';
import StatusBadge from '../components/common/StatusBadge';
import Spinner from '../components/common/Spinner';
import ConfirmModal from '../components/common/ConfirmModal';
import PaymentModal from '../components/invoice/PaymentModal';

export default function InvoiceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);

  const fetchInvoice = async () => {
    try {
      const res = await invoiceAPI.getOne(id);
      setInvoice(res.data.invoice);
    } catch (err) {
      toast.error(getErrorMessage(err));
      navigate('/invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // Show success toast if returning from payment
    if (searchParams.get('payment') === 'success') {
      toast.success('Payment completed! Verifying status…');
    }
  }, [id]);

  const handleDownloadPDF = async () => {
    setDownloading(true);
    try {
      const res = await invoiceAPI.downloadPDF(id);
      const blob = new Blob([res.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${invoice.invoiceId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDownloading(false);
    }
  };

  const handleSendEmail = async () => {
    setSending(true);
    try {
      await invoiceAPI.sendEmail(id);
      toast.success(`Invoice sent to ${invoice.clientEmail}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await invoiceAPI.delete(id);
      toast.success('Invoice deleted');
      navigate('/invoices');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setDeleting(false);
    }
  };

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href);
    toast.success('Invoice link copied!');
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" className="text-ink-400" />
      </div>
    );
  }

  if (!invoice) return null;

  const subtotal = invoice.items?.length > 0
    ? invoice.items.reduce((s, it) => s + it.total, 0)
    : invoice.amount;
  const taxAmt = invoice.tax ? (subtotal * invoice.tax / 100) : 0;
  const discAmt = invoice.discount ? (subtotal * invoice.discount / 100) : 0;
  const total = subtotal + taxAmt - discAmt;

  return (
    <div className="page-container max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb + actions */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link to="/invoices" className="btn-ghost px-2 py-2 text-ink-500">←</Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-black text-ink-900 font-mono">{invoice.invoiceId}</h1>
              <StatusBadge status={invoice.status} />
            </div>
            <p className="text-sm text-ink-500 mt-0.5">Created {formatDate(invoice.createdAt)}</p>
          </div>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <button onClick={handleCopyLink} className="btn-ghost text-sm">
            🔗 Copy Link
          </button>
          <button onClick={handleSendEmail} disabled={sending} className="btn-secondary text-sm">
            {sending ? <><Spinner size="sm" /> Sending…</> : '📧 Send Email'}
          </button>
          <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary text-sm">
            {downloading ? <><Spinner size="sm" /> Generating…</> : '⬇️ Download PDF'}
          </button>
          {invoice.status !== 'Paid' && (
            <button onClick={() => setPaymentModal(true)} className="btn-success text-sm">
              💳 Collect Payment
            </button>
          )}
          <Link to={`/invoices/${id}/edit`} className="btn-secondary text-sm">✏️ Edit</Link>
          <button onClick={() => setDeleteModal(true)} className="btn-danger text-sm">🗑 Delete</button>
        </div>
      </div>

      {/* Mobile actions */}
      <div className="sm:hidden grid grid-cols-2 gap-2">
        <button onClick={handleDownloadPDF} disabled={downloading} className="btn-secondary text-sm justify-center">
          {downloading ? <Spinner size="sm" /> : '⬇️'} PDF
        </button>
        <button onClick={handleSendEmail} disabled={sending} className="btn-secondary text-sm justify-center">
          {sending ? <Spinner size="sm" /> : '📧'} Email
        </button>
        {invoice.status !== 'Paid' && (
          <button onClick={() => setPaymentModal(true)} className="btn-success text-sm justify-center col-span-2">
            💳 Collect Payment
          </button>
        )}
        <Link to={`/invoices/${id}/edit`} className="btn-secondary text-sm justify-center">✏️ Edit</Link>
        <button onClick={() => setDeleteModal(true)} className="btn-danger text-sm justify-center">🗑 Delete</button>
      </div>

      {/* Invoice card */}
      <div className="card overflow-hidden">
        {/* Accent bar */}
        <div className="h-1.5 bg-gradient-to-r from-ink-900 via-brand-600 to-brand-400" />

        <div className="p-6 sm:p-8 space-y-8">
          {/* From / To */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">From</p>
              <div className="text-base font-bold text-ink-900">{user?.businessName || user?.name}</div>
              <div className="text-sm text-ink-500 mt-0.5">{user?.email}</div>
              {user?.businessAddress && <div className="text-sm text-ink-500">{user.businessAddress}</div>}
              {user?.businessPhone && <div className="text-sm text-ink-500">{user.businessPhone}</div>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Bill To</p>
              <div className="text-base font-bold text-ink-900">{invoice.clientName}</div>
              <div className="text-sm text-ink-500 mt-0.5">{invoice.clientEmail}</div>
              {invoice.clientAddress && <div className="text-sm text-ink-500">{invoice.clientAddress}</div>}
              {invoice.clientPhone && <div className="text-sm text-ink-500">{invoice.clientPhone}</div>}
            </div>
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-ink-50 rounded-xl">
            {[
              { label: 'Invoice ID', value: invoice.invoiceId, mono: true },
              { label: 'Issue Date', value: formatDate(invoice.createdAt) },
              { label: 'Due Date', value: formatDate(invoice.dueDate) },
              { label: 'Currency', value: invoice.currency || 'NGN' },
            ].map(m => (
              <div key={m.label}>
                <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-1">{m.label}</p>
                <p className={`text-sm font-semibold text-ink-900 ${m.mono ? 'font-mono' : ''}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-2">Description</p>
            <p className="text-sm text-ink-700 leading-relaxed">{invoice.description}</p>
          </div>

          {/* Line items */}
          {invoice.items && invoice.items.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-ink-400 mb-3">Line Items</p>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ink-200 bg-ink-50">
                      <th className="text-left py-2.5 px-4 text-xs font-bold text-ink-500 uppercase tracking-wider">Description</th>
                      <th className="text-center py-2.5 px-4 text-xs font-bold text-ink-500 uppercase tracking-wider">Qty</th>
                      <th className="text-right py-2.5 px-4 text-xs font-bold text-ink-500 uppercase tracking-wider">Unit Price</th>
                      <th className="text-right py-2.5 px-4 text-xs font-bold text-ink-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ink-50">
                    {invoice.items.map((item, i) => (
                      <tr key={i} className="hover:bg-ink-50/50">
                        <td className="py-3 px-4 text-sm text-ink-800">{item.description}</td>
                        <td className="py-3 px-4 text-sm text-ink-600 text-center">{item.quantity}</td>
                        <td className="py-3 px-4 text-sm text-ink-600 text-right">{formatCurrency(item.unitPrice, invoice.currency)}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-ink-900 text-right">{formatCurrency(item.total, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-full sm:w-72 space-y-2">
              <div className="flex justify-between text-sm text-ink-600 py-1.5">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, invoice.currency)}</span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm text-ink-600 py-1.5">
                  <span>Tax ({invoice.tax}%)</span>
                  <span>+ {formatCurrency(taxAmt, invoice.currency)}</span>
                </div>
              )}
              {invoice.discount > 0 && (
                <div className="flex justify-between text-sm text-ink-600 py-1.5">
                  <span>Discount ({invoice.discount}%)</span>
                  <span>- {formatCurrency(discAmt, invoice.currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-ink-900 text-xl py-3 border-t-2 border-ink-200">
                <span>Total Due</span>
                <span>{formatCurrency(total, invoice.currency)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-1">Notes</p>
              <p className="text-sm text-amber-800 leading-relaxed">{invoice.notes}</p>
            </div>
          )}

          {/* Payment info */}
          {invoice.status === 'Paid' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-emerald-600">✅</span>
                <span className="font-bold text-emerald-800">Payment Received</span>
              </div>
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {invoice.paidAt && (
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">Paid On</p>
                    <p className="text-emerald-900 font-medium">{formatDateFull(invoice.paidAt)}</p>
                  </div>
                )}
                {invoice.paymentGateway && (
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">Gateway</p>
                    <p className="text-emerald-900 font-medium capitalize">{invoice.paymentGateway}</p>
                  </div>
                )}
                {invoice.paymentReference && (
                  <div>
                    <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider mb-0.5">Reference</p>
                    <p className="text-emerald-900 font-mono text-xs break-all">{invoice.paymentReference}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ConfirmModal
        isOpen={deleteModal}
        title="Delete Invoice"
        message={`Are you sure you want to permanently delete invoice ${invoice.invoiceId}? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal(false)}
        loading={deleting}
        danger
      />

      {paymentModal && (
        <PaymentModal
          invoice={invoice}
          onClose={() => setPaymentModal(false)}
          onSuccess={fetchInvoice}
        />
      )}
    </div>
  );
}
