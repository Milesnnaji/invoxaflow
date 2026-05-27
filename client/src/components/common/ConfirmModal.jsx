import Spinner from './Spinner';

export default function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, loading, danger = true }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-ink-900/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md animate-in p-6">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-brand-100'}`}>
          <span className="text-2xl">{danger ? '⚠️' : '❓'}</span>
        </div>
        <h3 className="text-lg font-bold text-ink-900 mb-2">{title}</h3>
        <p className="text-sm text-ink-500 mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="btn-secondary" disabled={loading}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={danger ? 'btn-danger' : 'btn-primary'}
          >
            {loading && <Spinner size="sm" />}
            {loading ? 'Processing…' : 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
