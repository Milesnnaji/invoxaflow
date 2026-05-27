import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';
import { getErrorMessage } from '../utils/helpers';
import InvoiceForm from '../components/invoice/InvoiceForm';
import Spinner from '../components/common/Spinner';

export default function EditInvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await invoiceAPI.getOne(id);
        setInvoice(res.data.invoice);
      } catch (err) {
        toast.error(getErrorMessage(err));
        navigate('/invoices');
      } finally {
        setFetching(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await invoiceAPI.update(id, data);
      toast.success('Invoice updated successfully!');
      navigate(`/invoices/${id}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="page-container flex items-center justify-center min-h-[50vh]">
        <Spinner size="lg" className="text-ink-400" />
      </div>
    );
  }

  if (!invoice) return null;

  return (
    <div className="page-container max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/invoices/${id}`} className="btn-ghost px-2 py-2 text-ink-500">←</Link>
        <div>
          <h1 className="section-title">Edit Invoice</h1>
          <p className="text-sm font-mono text-ink-400 mt-0.5">{invoice.invoiceId}</p>
        </div>
      </div>

      <InvoiceForm
        initialData={invoice}
        onSubmit={handleSubmit}
        loading={loading}
        submitLabel="Update Invoice"
      />
    </div>
  );
}
