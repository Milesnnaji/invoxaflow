import { Link } from 'react-router-dom';

const Feature = ({ icon, title, desc }) => (
  <div className="p-6 bg-white rounded-2xl border border-ink-200 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
    <div className="w-10 h-10 bg-ink-100 rounded-xl flex items-center justify-center mb-4 text-xl">{icon}</div>
    <h3 className="font-bold text-ink-900 mb-1.5">{title}</h3>
    <p className="text-sm text-ink-500 leading-relaxed">{desc}</p>
  </div>
);

const Stat = ({ value, label }) => (
  <div className="text-center">
    <div className="text-3xl font-black text-ink-900 tracking-tight">{value}</div>
    <div className="text-sm text-ink-500 mt-1">{label}</div>
  </div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ink-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">IF</span>
            </div>
            <span className="font-extrabold text-ink-900">InvoxaFlow</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium text-ink-600 hover:text-ink-900 transition-colors px-3 py-1.5">
              Sign in
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2">
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-200 rounded-full px-4 py-1.5 mb-8">
          <span className="w-2 h-2 bg-brand-500 rounded-full animate-pulse" />
          <span className="text-xs font-semibold text-brand-700 uppercase tracking-wider">Built for African Freelancers</span>
        </div>
        <h1 className="text-5xl sm:text-6xl font-black text-ink-900 tracking-tight leading-none mb-6">
          Invoice smarter,
          <br />
          <span className="text-gradient">get paid faster.</span>
        </h1>
        <p className="text-lg text-ink-500 max-w-xl mx-auto leading-relaxed mb-10">
          Professional invoicing with Paystack & Flutterwave payments, PDF generation,
          and real-time tracking — designed for Nigerian freelancers & agencies.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link to="/register" className="btn-primary px-8 py-3 text-base">
            Start for free →
          </Link>
          <Link to="/login" className="btn-secondary px-8 py-3 text-base">
            Sign in
          </Link>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-sm mx-auto border-t border-ink-100 pt-12">
          <Stat value="₦0" label="Setup cost" />
          <Stat value="2min" label="First invoice" />
          <Stat value="100%" label="Yours to keep" />
        </div>
      </section>

      {/* Preview mockup */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="bg-ink-900 rounded-3xl overflow-hidden shadow-2xl">
          <div className="bg-ink-800 px-6 py-3 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="flex-1 text-center text-xs text-ink-400 font-mono">invoxaflow.app/dashboard</div>
          </div>
          <div className="p-8">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Invoices', value: '48', color: 'bg-blue-500' },
                { label: 'Paid', value: '36', color: 'bg-emerald-500' },
                { label: 'Pending', value: '8', color: 'bg-amber-500' },
                { label: 'Revenue', value: '₦1.2M', color: 'bg-purple-500' },
              ].map(card => (
                <div key={card.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className={`w-2 h-2 rounded-full ${card.color} mb-3`} />
                  <div className="text-white font-black text-xl">{card.value}</div>
                  <div className="text-ink-400 text-xs mt-0.5">{card.label}</div>
                </div>
              ))}
            </div>
            <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
                <span className="text-white text-sm font-semibold">Recent Invoices</span>
                <span className="text-xs text-ink-400">View all →</span>
              </div>
              {[
                { id: 'INV-A3F2-4821', client: 'TechCorp Nigeria', amount: '₦250,000', status: 'Paid', color: 'text-emerald-400' },
                { id: 'INV-B7D1-3309', client: 'StartupLagos', amount: '₦180,000', status: 'Pending', color: 'text-amber-400' },
                { id: 'INV-C9E4-8841', client: 'MediaHouse Ltd', amount: '₦95,000', status: 'Unpaid', color: 'text-red-400' },
              ].map(inv => (
                <div key={inv.id} className="px-4 py-3 flex items-center justify-between border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-white text-sm font-medium">{inv.client}</div>
                    <div className="text-ink-400 text-xs font-mono">{inv.id}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-white text-sm font-bold">{inv.amount}</div>
                    <div className={`text-xs font-semibold ${inv.color}`}>{inv.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-ink-900 tracking-tight mb-3">Everything you need</h2>
          <p className="text-ink-500 max-w-md mx-auto">From creating your first invoice to accepting payments — InvoxaFlow has you covered.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Feature icon="🧾" title="Professional Invoices" desc="Generate polished PDF invoices with your branding, logo, and itemised billing in seconds." />
          <Feature icon="💳" title="Paystack & Flutterwave" desc="Accept payments instantly via card, bank transfer, USSD. Funds go straight to your account." />
          <Feature icon="📧" title="Email Delivery" desc="Send invoices directly to your clients via email with a professional HTML template and PDF attachment." />
          <Feature icon="📊" title="Payment Tracking" desc="Real-time dashboard showing paid, unpaid, and overdue invoices. Never miss a payment." />
          <Feature icon="🔒" title="Secure & Private" desc="JWT authentication, encrypted passwords, and private invoice data. Your business is protected." />
          <Feature icon="📱" title="Mobile Friendly" desc="Works perfectly on any device. Manage your invoices from anywhere in Nigeria and beyond." />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-ink-900 py-20">
        <div className="max-w-2xl mx-auto text-center px-6">
          <h2 className="text-3xl font-black text-white tracking-tight mb-4">Ready to get paid?</h2>
          <p className="text-ink-400 mb-8">Join freelancers and agencies across Africa using InvoxaFlow.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-white text-ink-900 px-8 py-3 rounded-xl font-bold hover:bg-ink-100 transition-colors text-base">
            Create your free account →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ink-950 py-8">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="text-ink-900 font-black text-xs">IF</span>
            </div>
            <span className="text-ink-400 text-sm font-semibold">InvoxaFlow</span>
          </div>
          <p className="text-ink-600 text-sm">© {new Date().getFullYear()} InvoxaFlow. Built for Africa 🌍</p>
        </div>
      </footer>
    </div>
  );
}
