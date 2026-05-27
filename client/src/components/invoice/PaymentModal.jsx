import { useState } from 'react';
import toast from 'react-hot-toast';
import { paymentAPI } from '../../services/api';
import { formatCurrency, getErrorMessage } from '../../utils/helpers';
import Spinner from '../common/Spinner';

export default function PaymentModal({ invoice, onClose, onSuccess }) {
  const [gateway, setGateway] = useState('paystack');
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      if (gateway === 'paystack') {
        const res = await paymentAPI.initPaystack({ invoiceId: invoice._id });
        window.open(res.data.authorizationUrl, '_blank');
        toast.success('Redirecting to Paystack…');
        onClose();
      } else {
        const res = await paymentAPI.initFlutterwave({ invoiceId: invoice._id });
        window.open(res.data.paymentLink, '_blank');
        toast.success('Redirecting to Flutterwave…');
        onClose();
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    setLoading(true);
    try {
      const { invoiceAPI } = await import('../../services/api');
      await invoiceAPI.update(invoice._id, {
        status: 'Paid',
        paymentGateway: 'manual',
        paidAt: new Date().toISOString(),
      });
      toast.success('Invoice marked as paid!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-in">
        {/* Header */}
        <div className="px-6 py-5 border-b border-ink-100">
          <h3 className="font-bold text-ink-900 text-lg">Accept Payment</h3>
          <p className="text-sm text-ink-500 mt-0.5">
            {invoice.invoiceId} · {formatCurrency(invoice.amount, invoice.currency)}
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Gateway selector */}
          <div>
            <p className="text-sm font-semibold text-ink-700 mb-3">Select Payment Gateway</p>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'paystack', name: 'Paystack', icon: '🟢', desc: 'Card, Bank, USSD' },
                { id: 'flutterwave', name: 'Flutterwave', icon: '🟡', desc: 'Card, Mobile Money' },
              ].map(gw => (
                <button
                  key={gw.id}
                  type="button"
                  onClick={() => setGateway(gw.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-150 ${
                    gateway === gw.id
                      ? 'border-ink-900 bg-ink-50'
                      : 'border-ink-200 hover:border-ink-300'
                  }`}
                >
                  <div className="text-xl mb-2">{gw.icon}</div>
                  <div className="text-sm font-bold text-ink-900">{gw.name}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{gw.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Amount summary */}
          <div className="bg-ink-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ink-600">Amount to collect</span>
              <span className="text-xl font-black text-ink-900">
                {formatCurrency(invoice.amount, invoice.currency)}
              </span>
            </div>
            <div className="text-xs text-ink-400 mt-1">
              Client will pay via {gateway === 'paystack' ? 'Paystack' : 'Flutterwave'} checkout
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2.5">
            <button
              onClick={handlePay}
              disabled={loading}
              className="btn-primary w-full justify-center py-3"
            >
              {loading ? <><Spinner size="sm" /> Processing…</> : `Pay with ${gateway === 'paystack' ? 'Paystack' : 'Flutterwave'} →`}
            </button>
            <button
              onClick={handleMarkPaid}
              disabled={loading}
              className="btn-secondary w-full justify-center"
            >
              Mark as Paid Manually
            </button>
          </div>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-ink-100 text-ink-500 transition-colors"
        >×</button>
      </div>
    </div>
  );
}
