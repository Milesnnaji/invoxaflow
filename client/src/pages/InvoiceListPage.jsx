import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getErrorMessage, debounce, copyToClipboard } from '../utils/helpers';
import StatusBadge from '../components/common/StatusBadge';
import Spinner from '../components/common/Spinner';
import EmptyState from '../components/common/EmptyState';
import Pagination from '../components/common/Pagination';
import ConfirmModal from '../components/common/ConfirmModal';

const STATUSES = ['All', 'Paid', 'Unpaid', 'Pending', 'Overdue'];

export default function InvoiceListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 10, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState(searchParams.get('status') || 'All');
  const [deleteModal, setDeleteModal] = useState({ open: false, id: null });
  const [deleting, setDeleting] = useState(false);

  const fetchInvoices = useCallback(async (page = 1, searchVal = search, statusVal = status) => {
    setLoading(true);
    try {
      const res = await invoiceAPI.getAll({
        page,
        limit: 10,
        search: searchVal || undefined,
        status: statusVal !== 'All' ? statusVal : undefined,
      });
      setInvoices(res.data.invoices);
      setPagination(res.data.pagination);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices(1, search, status);
  }, [status]);

  const debouncedSearch = useCallback(
    debounce((val) => fetchInvoices(1, val, status), 400),
    [status]
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
    debouncedSearch(e.target.value);
  };

  const handleStatusChange = (s) => {
    setStatus(s);
    setSearchParams(s !== 'All' ? { status: s } : {});
  };

  const handlePageChange = (p) => fetchInvoices(p, search, status);

  const handleCopyLink = async (inv) => {
    const url = `${window.location.origin}/invoices/${inv._id}`;
    await copyToClipboard(url);
    toast.success('Invoice link copied!');
  };

  const handleDelete = async () => {
    if (!deleteModal.id) return;
    setDeleting(true);
    try {
      await invoiceAPI.delete(deleteModal.id);
      toast.success('Invoice deleted');
      setDeleteModal({ open: false, id: null });
      fetchInvoices(pagination.page, search, status);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-container space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="section-title">Invoices</h1>
          <p className="text-sm text-ink-500 mt-0.5">
            {pagination.total} invoice{pagination.total !== 1 ? 's' : ''} total
          </p>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <span>+</span> New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="card p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={handleSearch}
            placeholder="Search by client name, email, or invoice ID…"
            className="input-field pl-9"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); debouncedSearch(''); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 text-lg leading-none"
            >×</button>
          )}
        </div>

        {/* Status tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => handleStatusChange(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                status === s
                  ? 'bg-ink-900 text-white'
                  : 'bg-ink-100 text-ink-600 hover:bg-ink-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Spinner size="lg" className="text-ink-400" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon="🧾"
            title={search || status !== 'All' ? 'No invoices found' : 'No invoices yet'}
            message={
              search || status !== 'All'
                ? 'Try adjusting your search or filter'
                : 'Create your first invoice to get started'
            }
            action={
              !search && status === 'All' && (
                <Link to="/invoices/new" className="btn-primary text-sm">
                  + Create Invoice
                </Link>
              )
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-ink-100 bg-ink-50">
                    <th className="text-left px-6 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Invoice</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Due Date</th>
                    <th className="text-left px-6 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Status</th>
                    <th className="text-right px-6 py-3 text-xs font-bold text-ink-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {invoices.map(inv => (
                    <tr key={inv._id} className="hover:bg-ink-50/50 transition-colors group">
                      <td className="px-6 py-4">
                        <Link to={`/invoices/${inv._id}`} className="font-mono text-xs text-brand-600 hover:text-brand-700 font-semibold">
                          {inv.invoiceId}
                        </Link>
                        <div className="text-xs text-ink-400 mt-0.5">{formatDate(inv.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-semibold text-ink-900">{inv.clientName}</div>
                        <div className="text-xs text-ink-400">{inv.clientEmail}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-ink-900">
                          {formatCurrency(inv.amount, inv.currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-600">{formatDate(inv.dueDate)}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            to={`/invoices/${inv._id}`}
                            className="btn-ghost text-xs px-2.5 py-1.5"
                            title="View"
                          >👁</Link>
                          <Link
                            to={`/invoices/${inv._id}/edit`}
                            className="btn-ghost text-xs px-2.5 py-1.5"
                            title="Edit"
                          >✏️</Link>
                          <button
                            onClick={() => handleCopyLink(inv)}
                            className="btn-ghost text-xs px-2.5 py-1.5"
                            title="Copy link"
                          >🔗</button>
                          <button
                            onClick={() => setDeleteModal({ open: true, id: inv._id })}
                            className="btn-ghost text-xs px-2.5 py-1.5 hover:text-red-600 hover:bg-red-50"
                            title="Delete"
                          >🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-ink-100">
              {invoices.map(inv => (
                <div key={inv._id} className="p-4 hover:bg-ink-50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <Link to={`/invoices/${inv._id}`} className="text-sm font-semibold text-ink-900">
                        {inv.clientName}
                      </Link>
                      <div className="text-xs font-mono text-ink-400 mt-0.5">{inv.invoiceId}</div>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <div className="text-base font-black text-ink-900">{formatCurrency(inv.amount, inv.currency)}</div>
                      <div className="text-xs text-ink-400">Due {formatDate(inv.dueDate)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/invoices/${inv._id}`} className="btn-secondary text-xs py-1.5 px-3">View</Link>
                      <button
                        onClick={() => setDeleteModal({ open: true, id: inv._id })}
                        className="btn-ghost text-xs py-1.5 px-2 hover:text-red-600"
                      >🗑</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4">
              <Pagination
                page={pagination.page}
                pages={pagination.pages}
                total={pagination.total}
                limit={pagination.limit}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={deleteModal.open}
        title="Delete Invoice"
        message="This action cannot be undone. The invoice and all associated data will be permanently removed."
        onConfirm={handleDelete}
        onCancel={() => setDeleteModal({ open: false, id: null })}
        loading={deleting}
        danger
      />
    </div>
  );
}
