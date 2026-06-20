import { Star } from 'lucide-react';

export default function StarRating({ value = 0, max = 5, size = 'md', interactive = false, onChange }) {
  const sizeClass = { sm: 'w-3.5 h-3.5', md: 'w-5 h-5', lg: 'w-6 h-6' }[size] || 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(value);
        return (
          <button
            key={i}
            type={interactive ? 'button' : undefined}
            onClick={interactive ? () => onChange?.(i + 1) : undefined}
            className={interactive ? 'cursor-pointer transition-transform hover:scale-110' : 'cursor-default'}
          >
            <Star
              className={`${sizeClass} ${filled ? 'fill-accent-400 text-accent-400' : 'fill-gray-200 text-gray-200'}`}
            />
          </button>
        );
      })}
    </div>
  );
}
