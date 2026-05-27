import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/helpers';

const NavItem = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
      ${isActive
        ? 'bg-ink-900 text-white shadow-sm'
        : 'text-ink-600 hover:bg-ink-100 hover:text-ink-900'}`
    }
  >
    <span className="flex-shrink-0 text-lg">{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeSidebar = () => setSidebarOpen(false);

  const navItems = [
    { to: '/dashboard', icon: '⚡', label: 'Dashboard' },
    { to: '/invoices', icon: '🧾', label: 'Invoices' },
    { to: '/invoices/new', icon: '✏️', label: 'New Invoice' },
    { to: '/settings', icon: '⚙️', label: 'Settings' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-ink-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-ink-900 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-sm">IF</span>
          </div>
          <div>
            <div className="font-extrabold text-ink-900 text-sm tracking-tight">InvoxaFlow</div>
            <div className="text-xs text-ink-400 font-medium">Invoice Platform</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-bold text-ink-400 uppercase tracking-widest px-3 mb-3">Menu</div>
        {navItems.map(item => (
          <NavItem key={item.to} {...item} onClick={closeSidebar} />
        ))}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-ink-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-ink-50 mb-2">
          <div className="w-8 h-8 bg-ink-900 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-ink-900 truncate">{user?.name}</div>
            <div className="text-xs text-ink-400 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-ink-500 hover:bg-red-50 hover:text-red-600 transition-all duration-150"
        >
          <span>🚪</span>
          <span>Sign out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-ink-50 overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-shrink-0 w-56 bg-white border-r border-ink-200 flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={closeSidebar} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-ink-200 flex-shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-ink-100 transition-colors"
            aria-label="Open menu"
          >
            <svg className="w-5 h-5 text-ink-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-ink-900 rounded-md flex items-center justify-center">
              <span className="text-white font-black text-xs">IF</span>
            </div>
            <span className="font-extrabold text-ink-900 text-sm">InvoxaFlow</span>
          </div>
          <div className="w-9 h-9 bg-ink-900 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{getInitials(user?.name)}</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
