# Deploy frontend en Vercel

El backend productivo vive en Railway:

```
https://michanga-production.up.railway.app
```

## Configuracion del proyecto

- Root Directory: `client`
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm ci`

## Variables de entorno

Configurar en Vercel, dentro del proyecto del frontend:

| Variable | Valor |
| --- | --- |
| `VITE_API_URL` | `https://michanga-production.up.railway.app` |
| `VITE_PAYMENTS_ENABLED` | `false` |

`VITE_API_URL` debe ser el origen del backend, sin `/api` al final. El frontend agrega `/api` automaticamente para las llamadas HTTP y usa el mismo origen para Socket.IO.
