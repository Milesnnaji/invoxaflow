import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(form);
      toast.success('Welcome back!');
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
          <blockquote className="text-2xl font-bold text-white leading-snug mb-4">
            "Finally, an invoicing tool that understands the Nigerian market."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AO</span>
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Adeola Obi</div>
              <div className="text-ink-400 text-xs">Freelance Designer, Lagos</div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {['Paystack Ready', 'PDF Invoices', 'Free to use'].map(t => (
            <div key={t} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
              <div className="text-white text-xs font-semibold">{t}</div>
            </div>
          ))}
        </div>
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
            <h1 className="text-2xl font-black text-ink-900 tracking-tight">Welcome back</h1>
            <p className="text-ink-500 text-sm mt-1">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0" htmlFor="password">Password</label>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={form.password}
                  onChange={handleChange}
                  className="input-field pr-10"
                  placeholder="••••••••"
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
              {loading ? <><Spinner size="sm" /> Signing in…</> : 'Sign in →'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-ink-900 font-semibold hover:underline">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
