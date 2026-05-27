// Currency formatting
export const formatCurrency = (amount, currency = 'NGN') => {
  const symbols = {
    NGN: '₦', USD: '$', GBP: '£', EUR: '€',
    KES: 'KSh', GHS: 'GH₵', ZAR: 'R',
  };
  const sym = symbols[currency] || '₦';
  const num = Number(amount) || 0;
  return `${sym}${num.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

// Date formatting
export const formatDate = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
  });
};

export const formatDateFull = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-NG', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
};

export const formatDateTime = (date) => {
  if (!date) return '—';
  return new Date(date).toLocaleString('en-NG', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

export const isOverdue = (dueDate, status) => {
  return status !== 'Paid' && new Date(dueDate) < new Date();
};

// Status badge classes
export const getStatusClass = (status) => {
  const map = {
    'Paid': 'badge-paid',
    'Unpaid': 'badge-unpaid',
    'Pending': 'badge-pending',
    'Overdue': 'badge-overdue',
  };
  return map[status] || 'badge bg-ink-100 text-ink-600';
};

export const getStatusDot = (status) => {
  const map = {
    'Paid': 'bg-emerald-500',
    'Unpaid': 'bg-red-500',
    'Pending': 'bg-amber-500',
    'Overdue': 'bg-rose-600',
  };
  return map[status] || 'bg-ink-400';
};

// Copy to clipboard
export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // fallback
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    return true;
  }
};

// Truncate text
export const truncate = (str, len = 40) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};

// Get initials
export const getInitials = (name = '') => {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0]?.toUpperCase() || '')
    .join('');
};

// Debounce
export const debounce = (fn, delay) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

// Extract error message
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.errors?.[0]?.msg) return error.response.data.errors[0].msg;
  if (error?.message) return error.message;
  return 'An unexpected error occurred.';
};
