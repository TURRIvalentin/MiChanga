import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export function timeAgo(date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
}

export function formatPeso(amount) {
  if (!amount) return null;
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(amount);
}

export const CATEGORIAS = {
  CORTE_PASTO: { label: 'Corte de pasto', emoji: '🌿' },
  BARRIDO_VEREDA: { label: 'Barrido / limpieza de vereda', emoji: '🧹' },
  LIMPIEZA_VIDRIOS: { label: 'Limpieza de vidrios y ventanas', emoji: '🪟' },
  LAVADO_AUTO: { label: 'Lavado de auto a domicilio', emoji: '🚗' },
  MUDANZAS: { label: 'Mudanzas y fletes', emoji: '📦' },
  TRAMITES: { label: 'Trámites y gestiones', emoji: '📋' },
  OTROS: { label: 'Otros', emoji: '⭐' },
};

export const ESTADOS = {
  ABIERTA: { label: 'Abierta', color: 'bg-green-100 text-green-800' },
  EN_CURSO: { label: 'En curso', color: 'bg-primary-100 text-primary-800' },
  COMPLETADA: { label: 'Completada', color: 'bg-gray-100 text-gray-700' },
  CANCELADA: { label: 'Cancelada', color: 'bg-red-100 text-red-700' },
};

export const ZONAS = [
  'Almagro', 'Balvanera', 'Barracas', 'Belgrano', 'Boedo', 'Caballito',
  'Chacarita', 'Coghlan', 'Colegiales', 'Constitución', 'Flores', 'Floresta',
  'La Boca', 'La Paternal', 'Liniers', 'Mataderos', 'Monte Castro',
  'Monserrat', 'Nueva Pompeya', 'Núñez', 'Palermo', 'Parque Avellaneda',
  'Parque Chacabuco', 'Parque Chas', 'Parque Patricios', 'Puerto Madero',
  'Recoleta', 'Retiro', 'Saavedra', 'San Cristóbal', 'San Nicolás',
  'San Telmo', 'Vélez Sársfield', 'Villa Crespo', 'Villa del Parque',
  'Villa Devoto', 'Villa General Mitre', 'Villa Lugano', 'Villa Luro',
  'Villa Ortúzar', 'Villa Pueyrredón', 'Villa Real', 'Villa Riachuelo',
  'Villa Santa Rita', 'Villa Soldati', 'Villa Urquiza', 'GBA Norte',
  'GBA Sur', 'GBA Oeste',
];
