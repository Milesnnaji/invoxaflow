export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={`${sizes[size]} ${className} relative flex-shrink-0`}>
      <div className="absolute inset-0 rounded-full border-2 border-current opacity-20" />
      <div className="absolute inset-0 rounded-full border-2 border-t-current animate-spin" />
    </div>
  );
}
