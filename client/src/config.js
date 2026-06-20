// Activar en true cuando MercadoPago esté integrado en producción.
// Controlado por la variable de entorno VITE_PAYMENTS_ENABLED en client/.env
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';

const rawApiUrl = import.meta.env.VITE_API_URL || '';

export const API_BASE_URL = rawApiUrl.replace(/\/$/, '');
export const API_URL = API_BASE_URL ? `${API_BASE_URL}/api` : '/api';
