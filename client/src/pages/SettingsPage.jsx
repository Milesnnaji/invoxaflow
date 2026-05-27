import { useState } from 'react';
import toast from 'react-hot-toast';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage, getInitials } from '../utils/helpers';
import Spinner from '../components/common/Spinner';

const CURRENCIES = [
  { code: 'NGN', label: 'Nigerian Naira (₦)' },
  { code: 'USD', label: 'US Dollar ($)' },
  { code: 'GBP', label: 'British Pound (£)' },
  { code: 'EUR', label: 'Euro (€)' },
  { code: 'KES', label: 'Kenyan Shilling (KSh)' },
  { code: 'GHS', label: 'Ghanaian Cedi (GH₵)' },
  { code: 'ZAR', label: 'South African Rand (R)' },
];

const Section = ({ icon, title, desc, children }) => (
  <div className="card overflow-hidden">
    <div className="px-6 py-5 border-b border-ink-100 bg-ink-50/50">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-white border border-ink-200 rounded-xl flex items-center justify-center text-xl shadow-card">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-ink-900 text-sm">{title}</h2>
          {desc && <p className="text-xs text-ink-500 mt-0.5">{desc}</p>}
        </div>
      </div>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

export default function SettingsPage() {
  const { user, updateUserData } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    businessName: user?.businessName || '',
    businessAddress: user?.businessAddress || '',
    businessPhone: user?.businessPhone || '',
    website: user?.website || '',
    currency: user?.currency || 'NGN',
    emailSignature: user?.emailSignature || '',
    logo: user?.logo || '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState(user?.logo || '');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(p => ({ ...p, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(p => ({ ...p, [name]: value }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Logo must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target.result;
      setLogoPreview(base64);
      setProfile(p => ({ ...p, logo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!profile.name.trim()) {
      toast.error('Name is required');
      return;
    }
    setSavingProfile(true);
    try {
      const res = await userAPI.update(profile);
      updateUserData(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (!passwords.currentPassword || !passwords.newPassword) {
      toast.error('All password fields are required');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await userAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="page-container max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="section-title">Settings</h1>
        <p className="text-sm text-ink-500 mt-0.5">Manage your business profile and account</p>
      </div>

      {/* Business Profile */}
      <Section
        icon="🏢"
        title="Business Profile"
        desc="This info appears on your invoices and emails"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          {/* Logo */}
          <div>
            <label className="label">Business Logo</label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center overflow-hidden border border-ink-200 flex-shrink-0">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo" className="w-full h-full object-contain" />
                ) : (
                  <span className="text-xl font-black text-ink-400">
                    {getInitials(profile.businessName || profile.name)}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <label className="cursor-pointer">
                  <span className="btn-secondary text-sm inline-flex items-center gap-2">
                    📎 Upload Logo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-ink-400 mt-1.5">PNG, JPG up to 2MB. Square recommended.</p>
                {logoPreview && (
                  <button
                    type="button"
                    onClick={() => { setLogoPreview(''); setProfile(p => ({ ...p, logo: '' })); }}
                    className="text-xs text-red-500 hover:text-red-700 mt-1 transition-colors"
                  >
                    Remove logo
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="divider" />

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Your Name *</label>
              <input name="name" value={profile.name} onChange={handleProfileChange} className="input-field" placeholder="Emeka Okafor" />
            </div>
            <div>
              <label className="label">Business Name</label>
              <input name="businessName" value={profile.businessName} onChange={handleProfileChange} className="input-field" placeholder="Okafor Designs" />
            </div>
            <div>
              <label className="label">Business Phone</label>
              <input name="businessPhone" value={profile.businessPhone} onChange={handleProfileChange} className="input-field" placeholder="+234 801 234 5678" />
            </div>
            <div>
              <label className="label">Website</label>
              <input name="website" value={profile.website} onChange={handleProfileChange} className="input-field" placeholder="https://yoursite.com" />
            </div>
          </div>

          <div>
            <label className="label">Business Address</label>
            <input name="businessAddress" value={profile.businessAddress} onChange={handleProfileChange} className="input-field" placeholder="123 Victoria Island, Lagos, Nigeria" />
          </div>

          <div>
            <label className="label">Default Currency</label>
            <select name="currency" value={profile.currency} onChange={handleProfileChange} className="input-field">
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Email Signature{' '}
              <span className="text-ink-400 font-normal">(appears at bottom of invoice emails)</span>
            </label>
            <textarea
              name="emailSignature"
              value={profile.emailSignature}
              onChange={handleProfileChange}
              rows={3}
              className="input-field resize-none"
              placeholder="Best regards,&#10;Emeka Okafor&#10;Okafor Designs | +234 801 234 5678"
            />
          </div>

          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile} className="btn-primary px-6">
              {savingProfile ? <><Spinner size="sm" /> Saving…</> : '💾 Save Profile'}
            </button>
          </div>
        </form>
      </Section>

      {/* Account info */}
      <Section icon="👤" title="Account Info" desc="Your login credentials">
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3.5 bg-ink-50 rounded-xl">
            <div>
              <p className="text-xs text-ink-500 font-medium">Email address</p>
              <p className="text-sm font-semibold text-ink-900 mt-0.5">{user?.email}</p>
            </div>
            <span className="badge bg-ink-200 text-ink-600 text-xs">Verified</span>
          </div>
          <div className="flex items-center justify-between p-3.5 bg-ink-50 rounded-xl">
            <div>
              <p className="text-xs text-ink-500 font-medium">Member since</p>
              <p className="text-sm font-semibold text-ink-900 mt-0.5">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })
                  : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Change Password */}
      <Section icon="🔒" title="Change Password" desc="Use a strong password to keep your account secure">
        <form onSubmit={handleSavePassword} className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input
              name="currentPassword"
              type="password"
              value={passwords.currentPassword}
              onChange={handlePasswordChange}
              className="input-field"
              placeholder="Enter current password"
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="label">New Password</label>
            <input
              name="newPassword"
              type="password"
              value={passwords.newPassword}
              onChange={handlePasswordChange}
              className="input-field"
              placeholder="Min. 6 characters"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <input
              name="confirmPassword"
              type="password"
              value={passwords.confirmPassword}
              onChange={handlePasswordChange}
              className="input-field"
              placeholder="Repeat new password"
              autoComplete="new-password"
            />
          </div>
          {passwords.newPassword && passwords.confirmPassword && (
            <div className={`text-xs font-medium flex items-center gap-1.5 ${
              passwords.newPassword === passwords.confirmPassword ? 'text-emerald-600' : 'text-red-500'
            }`}>
              <span>{passwords.newPassword === passwords.confirmPassword ? '✓' : '✗'}</span>
              {passwords.newPassword === passwords.confirmPassword ? 'Passwords match' : 'Passwords do not match'}
            </div>
          )}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPassword} className="btn-primary px-6">
              {savingPassword ? <><Spinner size="sm" /> Saving…</> : '🔑 Update Password'}
            </button>
          </div>
        </form>
      </Section>

      {/* Payment gateways info */}
      <Section icon="💳" title="Payment Gateways" desc="Configure your payment credentials in environment variables">
        <div className="space-y-3">
          {[
            { name: 'Paystack', icon: '🟢', desc: 'Card, Bank Transfer, USSD, QR Code', key: 'PAYSTACK_SECRET_KEY' },
            { name: 'Flutterwave', icon: '🟡', desc: 'Card, Mobile Money, Bank Transfer', key: 'FLUTTERWAVE_SECRET_KEY' },
          ].map(gw => (
            <div key={gw.name} className="flex items-center gap-4 p-4 bg-ink-50 rounded-xl border border-ink-200">
              <span className="text-2xl">{gw.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-ink-900">{gw.name}</p>
                <p className="text-xs text-ink-500 mt-0.5">{gw.desc}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <code className="text-xs bg-ink-200 text-ink-600 px-2 py-0.5 rounded font-mono">{gw.key}</code>
                <p className="text-xs text-ink-400 mt-1">Set in .env</p>
              </div>
            </div>
          ))}
          <p className="text-xs text-ink-400 leading-relaxed">
            Add your secret keys to the server <code className="bg-ink-100 px-1 py-0.5 rounded text-ink-600">.env</code> file.
            Get keys from your <a href="https://dashboard.paystack.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Paystack</a> and{' '}
            <a href="https://dashboard.flutterwave.com" target="_blank" rel="noreferrer" className="text-brand-600 hover:underline">Flutterwave</a> dashboards.
          </p>
        </div>
      </Section>
    </div>
  );
}
