import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { invoiceAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, getErrorMessage } from '../utils/helpers';
import StatusBadge from '../components/common/StatusBadge';
import Spinner from '../components/common/Spinner';

const StatCard = ({ label, value, icon, sub, color = 'bg-ink-50', textColor = 'text-ink-900' }) => (
  <div className="card p-5 animate-in">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center text-xl flex-shrink-0`}>
        {icon}
      </div>
    </div>
    <div className={`text-2xl font-black tracking-tight ${textColor} mb-0.5`}>{value}</div>
    <div className="text-sm text-ink-500 font-medium">{label}</div>
    {sub && <div className="text-xs text-ink-400 mt-1">{sub}</div>}
  </div>
);

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await invoiceAPI.getStats();
        setStats(res.data.stats);
        setRecentInvoices(res.data.recentInvoices);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Spinner size="lg" className="text-ink-400 mx-auto mb-3" />
          <p className="text-sm text-ink-400">Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const paidRate = stats?.total > 0 ? Math.round((stats.paid / stats.total) * 100) : 0;

  return (
    <div className="page-container space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-sm text-ink-500 font-medium mb-0.5">{getGreeting()},</p>
          <h1 className="text-2xl font-black text-ink-900 tracking-tight">
            {user?.businessName || user?.name} 👋
          </h1>
        </div>
        <Link to="/invoices/new" className="btn-primary">
          <span>+</span> New Invoice
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Invoices"
          value={stats?.total ?? 0}
          icon="🧾"
          color="bg-ink-100"
          sub="All time"
        />
        <StatCard
          label="Paid"
          value={stats?.paid ?? 0}
          icon="✅"
          color="bg-emerald-100"
          textColor="text-emerald-700"
          sub={`${paidRate}% collection rate`}
        />
        <StatCard
          label="Unpaid / Pending"
          value={(stats?.unpaid ?? 0) + (stats?.pending ?? 0)}
          icon="⏳"
          color="bg-amber-100"
          textColor="text-amber-700"
          sub={stats?.overdue > 0 ? `${stats.overdue} overdue` : 'No overdue'}
        />
        <StatCard
          label="Total Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0, user?.currency)}
          icon="💰"
          color="bg-blue-100"
          textColor="text-blue-700"
          sub="From paid invoices"
        />
      </div>

      {/* Progress bar */}
      {stats?.total > 0 && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-ink-700">Collection Progress</span>
            <span className="text-sm font-bold text-ink-900">{paidRate}%</span>
          </div>
          <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700"
              style={{ width: `${paidRate}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-ink-400">
            <span>{stats.paid} paid</span>
            <span>{stats.total - stats.paid} outstanding</span>
          </div>
        </div>
      )}

      {/* Recent invoices */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-ink-100 flex items-center justify-between">
          <h2 className="font-bold text-ink-900">Recent Invoices</h2>
          <Link to="/invoices" className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors">
            View all →
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="w-12 h-12 bg-ink-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-3">🧾</div>
            <p className="text-sm font-semibold text-ink-600 mb-1">No invoices yet</p>
            <p className="text-xs text-ink-400 mb-4">Create your first invoice to get started</p>
            <Link to="/invoices/new" className="btn-primary text-xs px-4 py-2">
              + Create Invoice
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-ink-50">
            {recentInvoices.map((inv) => (
              <Link
                key={inv._id}
                to={`/invoices/${inv._id}`}
                className="flex items-center gap-4 px-6 py-4 hover:bg-ink-50 transition-colors group"
              >
                <div className="w-9 h-9 bg-ink-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-ink-200 transition-colors">
                  <span className="text-ink-600 font-bold text-xs">
                    {inv.clientName?.slice(0, 2).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-ink-900 truncate">{inv.clientName}</span>
                  </div>
                  <div className="text-xs text-ink-400 font-mono mt-0.5">{inv.invoiceId}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-ink-900">
                    {formatCurrency(inv.amount, inv.currency)}
                  </div>
                  <div className="mt-0.5">
                    <StatusBadge status={inv.status} />
                  </div>
                </div>
                <div className="text-xs text-ink-400 flex-shrink-0 hidden sm:block w-24 text-right">
                  {formatDate(inv.createdAt)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/invoices/new', icon: '✏️', label: 'Create Invoice', desc: 'New professional invoice' },
          { to: '/invoices?status=Unpaid', icon: '🔔', label: 'Unpaid Invoices', desc: `${stats?.unpaid ?? 0} awaiting payment` },
          { to: '/settings', icon: '⚙️', label: 'Business Settings', desc: 'Logo, name, signature' },
        ].map(a => (
          <Link
            key={a.to}
            to={a.to}
            className="card-hover p-5 flex items-center gap-4 group cursor-pointer"
          >
            <div className="w-10 h-10 bg-ink-100 rounded-xl flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-ink-200 transition-colors">
              {a.icon}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-ink-900">{a.label}</div>
              <div className="text-xs text-ink-400 mt-0.5">{a.desc}</div>
            </div>
            <span className="ml-auto text-ink-300 group-hover:text-ink-600 transition-colors flex-shrink-0">→</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
