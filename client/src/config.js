// Activar en true cuando MercadoPago esté integrado en producción.
// Controlado por la variable de entorno VITE_PAYMENTS_ENABLED en client/.env
export const PAYMENTS_ENABLED = import.meta.env.VITE_PAYMENTS_ENABLED === 'true';
