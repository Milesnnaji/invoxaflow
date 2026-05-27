export default function Pagination({ page, pages, total, limit, onPageChange }) {
  if (pages <= 1) return null;

  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const getPages = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', pages];
    if (page >= pages - 3) return [1, '…', pages - 4, pages - 3, pages - 2, pages - 1, pages];
    return [1, '…', page - 1, page, page + 1, '…', pages];
  };

  return (
    <div className="flex items-center justify-between pt-4 border-t border-ink-100">
      <p className="text-sm text-ink-500">
        Showing <span className="font-semibold text-ink-700">{from}–{to}</span> of{' '}
        <span className="font-semibold text-ink-700">{total}</span>
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="px-3 py-1.5 text-sm rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ←
        </button>
        {getPages().map((p, i) =>
          p === '…' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-ink-400">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                p === page
                  ? 'bg-ink-900 text-white'
                  : 'border border-ink-200 text-ink-600 hover:bg-ink-50'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === pages}
          className="px-3 py-1.5 text-sm rounded-lg border border-ink-200 text-ink-600 hover:bg-ink-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          →
        </button>
      </div>
    </div>
  );
}
