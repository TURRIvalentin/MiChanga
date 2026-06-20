import { ESTADOS } from '../../utils/helpers';

export function StatusBadge({ estado }) {
  const { label, color } = ESTADOS[estado] || { label: estado, color: 'bg-gray-100 text-gray-700' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {label}
    </span>
  );
}

export function CategoryBadge({ categoria, categorias }) {
  const cat = categorias?.[categoria];
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700 border border-primary-100">
      {cat?.emoji} {cat?.label || categoria}
    </span>
  );
}
