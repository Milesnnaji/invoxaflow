import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import InvoiceForm from '../components/invoice/InvoiceForm';

export default function CreateInvoicePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await invoiceAPI.create(data);
      toast.success('Invoice created successfully! 🎉');
      navigate(`/invoices/${res.data.invoice._id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/invoices" className="btn-ghost px-2 py-2 text-ink-500">
          ←
        </Link>
        <div>
          <h1 className="section-title">New Invoice</h1>
          <p className="text-sm text-ink-500 mt-0.5">Fill in the details below to create an invoice</p>
        </div>
      </div>

      <InvoiceForm
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Create Invoice"
      />
    </div>
  );
}
