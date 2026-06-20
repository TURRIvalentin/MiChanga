# Guía de Deploy — MiChanga (Opción A)

Arquitectura actual (lanzamiento sin pagos):

```
Railway (Express API + frontend estático)  →  Neon (PostgreSQL)
```

Express sirve el build de React desde `client/dist`. Un solo servicio en Railway, sin Vercel.
MercadoPago está desactivado por flag — se reactiva más adelante sin cambios de infraestructura.

Los pasos marcados con **[vos]** requieren que entres a una web o crees una cuenta.
Los marcados con **[código]** ya están listos — solo necesitás copiar los valores.

---

## 1. Base de datos — Neon (PostgreSQL gratuito)

**[vos]**

1. Crear cuenta en https://neon.tech (gratis, sin tarjeta)
2. Crear un nuevo proyecto → elegir región **South America (São Paulo)** o la más cercana
3. Crear una base de datos llamada `michanga`
4. Copiar la **Connection string** que te da Neon. Se ve así:
   ```
   postgresql://usuario:contraseña@ep-xxx.sa-east-1.aws.neon.tech/michanga?sslmode=require
   ```
5. Guardar ese string — lo necesitás como `DATABASE_URL` en Railway

---

## 2. Preparar el build del frontend

**[código]** Antes de hacer deploy, buildear el cliente una vez:

```bash
cd client
npm run build        # genera client/dist/
```

Verificar que `client/dist/` existe y tiene archivos antes de continuar.

> **Nota:** `client/dist/` ya está en `.gitignore`. Para deployar en Railway con Option A
> hay dos formas de incluirlo:
>
> **a) Commitear el build (más simple):**
> ```bash
> git add client/dist -f
> git commit -m "include client build for production"
> git push
> ```
>
> **b) Buildear en Railway como parte del deploy (recomendado para CI/CD):**
> - Configurar el build command en Railway como:
>   `cd ../client && npm ci && npm run build && cd ../server && npm ci && npx prisma generate`

---

## 3. Backend + Frontend — Railway

**[vos]**

1. Crear cuenta en https://railway.app (tiene free tier)
2. Nuevo proyecto → **Deploy from GitHub repo** → seleccioná el repo de MiChanga
3. En la sección de configuración del servicio:
   - **Root directory:** `server`
   - **Start command:** `node server.js`
   - **Build command (opción b del paso 2):**
     ```
     cd ../client && npm ci && npm run build && cd ../server && npm ci && npx prisma generate
     ```
     Si usaste la opción a (build commiteado), solo:
     ```
     npm ci && npx prisma generate
     ```

4. En la sección **Variables** del servicio, cargar:

   | Variable | Valor |
   |---|---|
   | `DATABASE_URL` | Connection string de Neon (paso 1) |
   | `JWT_SECRET` | Generar con el comando de abajo |
   | `NODE_ENV` | `production` |
   | `PORT` | Dejarlo vacío — Railway lo inyecta automáticamente |
   | `CLIENT_URL` | La URL pública del mismo servicio (la obtenés después del primer deploy) |

**[código]** Generar JWT_SECRET seguro:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

5. Hacer deploy. Railway te da una URL pública tipo `https://michanga.up.railway.app`.
   Volver a la sección Variables y setear `CLIENT_URL` con esa URL.

6. Correr las migraciones de base de datos (una sola vez):

   En Railway, abrir la consola del servicio (tab **Shell**) y ejecutar:
   ```bash
   npm run db:migrate
   ```
   O desde local apuntando a la DB de producción:
   ```bash
   DATABASE_URL="postgresql://..." cd server && npm run db:migrate
   ```

---

## 4. Verificar el deploy

Una vez deployado, verificar:

```bash
# Health check del API
curl https://michanga.up.railway.app/api/health

# Debe responder:
# {"status":"ok","mensaje":"¡MiChanga está andando!"}
```

Y acceder desde el browser a `https://michanga.up.railway.app` — debe cargar el frontend.

---

## 5. Checklist final antes de lanzar

- [ ] `DATABASE_URL` apunta a Neon (no a localhost)
- [ ] `JWT_SECRET` es largo y aleatorio (mínimo 32 chars), no el placeholder del `.env.example`
- [ ] `NODE_ENV=production` configurado en Railway
- [ ] `CLIENT_URL` es la URL pública de Railway (para CORS)
- [ ] Las migraciones corrieron en la DB de producción (`npm run db:migrate`)
- [ ] El seed de producción **NO** corrió (o si corrió, eliminar usuarios de prueba)
- [ ] `server/.env` NO está commiteado (está en `.gitignore`)
- [ ] El frontend carga correctamente desde la URL de Railway
- [ ] El health check `/api/health` responde `200 OK`

---

## Variables de entorno — resumen completo

| Variable | Local | Producción (Railway) |
|---|---|---|
| `DATABASE_URL` | `postgresql://...@localhost:5432/michanga` | Connection string de Neon |
| `JWT_SECRET` | Cualquier string | String aleatorio de 32+ chars |
| `PORT` | `4000` | Railway lo inyecta automáticamente — no setear |
| `NODE_ENV` | no hace falta | `production` |
| `CLIENT_URL` | `http://localhost:5173` | `https://michanga.up.railway.app` |

---

## Activar pagos en el futuro (MercadoPago)

Cuando quieras activar la integración de pagos, el código ya está implementado.
Solo necesitás:

1. Agregar las variables en Railway:
   ```
   MP_ACCESS_TOKEN=APP_USR-...      # credencial productiva de MercadoPago
   SERVER_URL=https://michanga.up.railway.app
   PLATFORM_FEE_PERCENT=0
   ```

2. En Railway, agregar una **Build Variable** (no Runtime):
   ```
   VITE_PAYMENTS_ENABLED=true
   ```

3. Configurar el webhook en el panel de MercadoPago:
   - URL: `https://michanga.up.railway.app/api/pagos/webhook`
   - Evento: `payment`

4. Rediployar. El flag de build hace que el frontend incluya los componentes de pago
   en el bundle; sin ese flag no hay código de pagos visible en el cliente.

**Tarjetas de prueba (Sandbox):** https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards
