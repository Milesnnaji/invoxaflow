import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', businessName: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error('Name, email, and password are required');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to InvoxaFlow 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-ink-900 flex-col justify-between p-12">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <span className="text-ink-900 font-black text-sm">IF</span>
          </div>
          <span className="text-white font-extrabold">InvoxaFlow</span>
        </Link>
        <div>
          <h2 className="text-3xl font-black text-white leading-tight mb-4">
            Join thousands of<br />African freelancers.
          </h2>
          <ul className="space-y-3">
            {[
              'Create unlimited professional invoices',
              'Accept Paystack & Flutterwave payments',
              'Send invoices via email in one click',
              'Track payments in real-time',
            ].map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-ink-300">
                <span className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 text-xs">✓</span>
                {f}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-ink-500 text-sm">No credit card required. Free forever.</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8 flex items-center gap-2.5">
            <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-sm">IF</span>
            </div>
            <span className="font-extrabold text-ink-900">InvoxaFlow</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-ink-900 tracking-tight">Create your account</h1>
            <p className="text-ink-500 text-sm mt-1">Start sending invoices in minutes</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={handleChange}
                className="input-field"
                placeholder="Emeka Okafor"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="businessName">Business name <span className="text-ink-400 font-normal">(optional)</span></label>
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={form.businessName}
                onChange={handleChange}
                className="input-field"
                placeholder="Okafor Designs"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="Min. 6 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 hover:text-ink-600 transition-colors"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 mt-2">
              {loading ? <><Spinner size="sm" /> Creating account…</> : 'Create account →'}
            </button>
          </form>

          <p className="text-center text-xs text-ink-400 mt-4">
            By creating an account, you agree to our Terms of Service.
          </p>

          <p className="text-center text-sm text-ink-500 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-ink-900 font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
