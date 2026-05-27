export default function EmptyState({ icon = '📄', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-ink-100 rounded-2xl flex items-center justify-center mb-4 text-3xl">
        {icon}
      </div>
      <h3 className="text-base font-semibold text-ink-700 mb-1">{title}</h3>
      <p className="text-sm text-ink-400 max-w-xs mb-6">{message}</p>
      {action}
    </div>
  );
}
