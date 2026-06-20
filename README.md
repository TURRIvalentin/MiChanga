# MiChanga 🇦🇷

**El marketplace de changas y servicios informales en Argentina.**

Conectamos personas que necesitan ayuda con changadores de confianza en el mismo barrio. Trámites, mudanzas, mandados, limpieza, tecnología, cuidado de personas y mucho más.

## Stack tecnológico

- **Frontend:** React 18 + Vite + Tailwind CSS + Socket.io-client
- **Backend:** Node.js + Express + Socket.io
- **Base de datos:** PostgreSQL + Prisma ORM
- **Autenticación:** JWT (JSON Web Tokens)
- **Tiempo real:** Socket.io (chat y notificaciones)
- **Pagos:** MercadoPago Checkout Pro (escrow / pago retenido)

## Estructura del proyecto

```
MiChanga/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Componentes reutilizables
│   │   │   ├── layout/     # Navbar
│   │   │   └── ui/         # Toast, StarRating, Spinner, Badge
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── hooks/          # useSocket
│   │   ├── pages/          # Todas las páginas/vistas
│   │   ├── services/       # api.js (axios), socket.js
│   │   └── utils/          # helpers.js (fechas, categorías, etc.)
│   ├── index.html
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── server/                 # Backend Express
│   ├── controllers/        # Lógica de negocio
│   ├── middleware/         # auth.js (JWT)
│   ├── routes/             # Rutas de la API
│   ├── prisma/
│   │   ├── schema.prisma   # Modelos de la DB
│   │   └── seed.js         # Datos de prueba
│   ├── server.js           # Punto de entrada
│   └── .env.example
│
└── README.md
```

## Requisitos previos

- **Node.js** v18 o superior
- **PostgreSQL** v14 o superior (corriendo localmente o en la nube)
- **npm** v9+

## Instalación paso a paso

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd MiChanga
```

### 2. Configurar el servidor

```bash
cd server
npm install
```

Crear el archivo `.env` copiando el ejemplo:

```bash
cp .env.example .env
```

Editar `.env` con tus datos:

```env
DATABASE_URL="postgresql://USUARIO:CONTRASEÑA@localhost:5432/michanga"
JWT_SECRET="un_secreto_muy_largo_y_seguro_cambialo"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 3. Crear la base de datos en PostgreSQL

Conectate a PostgreSQL y ejecutá:

```sql
CREATE DATABASE michanga;
```

O si usás `psql`:

```bash
psql -U postgres -c "CREATE DATABASE michanga;"
```

### 4. Migrar la base de datos y cargar datos de prueba

```bash
# Dentro de /server (siempre usar npm run, NO npx prisma directamente)
npm run db:migrate    # Crea las tablas
npm run db:seed       # Carga usuarios y changas de prueba
```

> **Importante:** Usá `npm run db:migrate` (no `npx prisma migrate dev`). El proyecto está fijado a Prisma 5.7.1 — si usás `npx` directamente puede bajar la versión global 7.x que tiene cambios incompatibles.

### 5. Configurar el cliente

```bash
cd ../client
npm install
```

No necesita archivo `.env` adicional. El proxy de Vite redirige `/api` al servidor en puerto 4000.

## Levantar el proyecto

Abrí **dos terminales**:

**Terminal 1 — Backend:**
```bash
cd server
npm run dev
# → Servidor corriendo en http://localhost:4000
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
# → App disponible en http://localhost:5173
```

Abrí el navegador en **http://localhost:5173** y ¡listo!

## Usuarios de prueba (seed)

| Email | Contraseña | Rol | Zona |
|-------|-----------|-----|------|
| maria@example.com | password123 | Changadora / Contratante | Palermo |
| carlos@example.com | password123 | Changador (con camioneta) | Flores |
| ana@example.com | password123 | Changadora (tecnología) | Belgrano |
| juan@example.com | password123 | Contratante | San Telmo |
| laura@example.com | password123 | Changadora (enfermera) | Villa Crespo |
| roberto@example.com | password123 | Changador / Contratante | Caballito |

## API REST

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/register` | Registro de usuario |
| POST | `/api/auth/login` | Login (devuelve JWT) |
| GET | `/api/auth/me` | Usuario actual (requiere token) |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/:id` | Perfil público |
| PUT | `/api/users/:id` | Editar perfil propio |
| GET | `/api/users/:id/calificaciones` | Calificaciones recibidas |

### Changas (Tareas)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/tareas` | Listar changas (con filtros) |
| GET | `/api/tareas/:id` | Detalle de changa |
| POST | `/api/tareas` | Publicar changa |
| PUT | `/api/tareas/:id` | Editar changa |
| DELETE | `/api/tareas/:id` | Eliminar changa |
| PATCH | `/api/tareas/:id/estado` | Cambiar estado |
| POST | `/api/tareas/:id/acordar-precio` | Proponer/aceptar/rechazar precio |

### Pagos (MercadoPago)
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/pagos/crear-preferencia` | Crea preferencia de Checkout Pro |
| POST | `/api/pagos/webhook` | Webhook de notificaciones MP (sin auth) |
| GET | `/api/pagos/confirmar-retorno` | Confirmación desde URL de retorno |
| GET | `/api/pagos/tarea/:tareaId` | Estado del pago de una changa |
| GET | `/api/pagos/mis-pagos` | Historial: realizados y recibidos |
| POST | `/api/pagos/liberar/:pagoId` | Liberar pago al changador |
| POST | `/api/pagos/reembolsar/:pagoId` | Reembolsar pago al contratante |

### Postulaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/postulaciones` | Postularse a una changa |
| GET | `/api/postulaciones/mis-postulaciones` | Mis postulaciones |
| GET | `/api/postulaciones/tarea/:id` | Postulaciones de una changa |
| PATCH | `/api/postulaciones/:id/aceptar` | Aceptar postulación |
| PATCH | `/api/postulaciones/:id/rechazar` | Rechazar postulación |

### Mensajes
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/mensajes/tarea/:tareaId` | Mensajes del chat |
| POST | `/api/mensajes` | Enviar mensaje |

### Calificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/calificaciones` | Calificar a un usuario |
| GET | `/api/calificaciones/usuario/:id` | Ver calificaciones de alguien |

## Eventos Socket.io

El servidor emite estos eventos en tiempo real:

| Evento | Descripción | Destinatario |
|--------|-------------|--------------|
| `nueva_postulacion` | Alguien se postuló | Sala del contratante |
| `postulacion_aceptada` | Tu postulación fue aceptada | Sala del changador |
| `postulacion_rechazada` | Tu postulación fue rechazada | Sala del changador |
| `tarea_completada` | La changa se completó | Sala del changador |
| `nuevo_mensaje` | Nuevo mensaje en el chat | Sala del chat |
| `precio_propuesto` | Alguien propuso un precio | Sala del chat |
| `precio_acordado` | Precio aceptado por ambas partes | Sala del chat |
| `precio_rechazado` | Propuesta de precio rechazada | Sala del chat |
| `listo_para_pagar` | Precio acordado, puede pagar | Sala del contratante |
| `estado_pago_actualizado` | Cambió el estado del pago | Sala del chat + usuarios |
| `pago_liberado` | Pago liberado al changador | Sala del changador |
| `pago_reembolsado` | Pago devuelto al contratante | Sala del contratante |

## Integración MercadoPago

### Configuración (Sandbox / Test)

1. Creá una cuenta en [MercadoPago Developers](https://www.mercadopago.com.ar/developers/panel)
2. Accedé a **Tus integraciones → Crear aplicación**
3. En **Credenciales de prueba** copiá:
   - `Access Token` → variable `MP_ACCESS_TOKEN`
   - `Public Key` → variable `MP_PUBLIC_KEY`
4. Para testear pagos usá las [tarjetas de prueba de MP](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/your-integrations/test/cards)

### Webhooks en desarrollo local

Como MP no puede llamar a `localhost`, necesitás exponer tu servidor:

```bash
# Instalar ngrok (una sola vez)
npm install -g ngrok   # o descargar de https://ngrok.com

# Exponer el servidor local
ngrok http 4000

# Copiar la URL HTTPS generada (ej: https://abc123.ngrok.io)
# y agregarla al .env:
SERVER_URL="https://abc123.ngrok.io"
```

> **Alternativa sin ngrok:** Para pruebas locales podés ignorar los webhooks y usar solo las URLs de retorno (`/pago/exitoso`). El frontend llama a `/api/pagos/confirmar-retorno` automáticamente al redirigir desde MP.

### Flujo de pago

```
1. Contratante + Changador acuerdan precio en el chat
   → Clic en "Acordar precio" → proponer monto → el otro acepta

2. Aparece botón "Pagar con MercadoPago" en el chat
   → Se abre Checkout Pro de MP en nueva pestaña

3. Contratante paga con tarjeta/billetera virtual (sandbox)
   → MP redirige a /pago/exitoso
   → Backend actualiza pago.estado = RETENIDO

4. La changa se realiza

5. Contratante marca la changa como "Completada"
   → Sistema auto-libera el pago (estado = LIBERADO)
   → En producción: se haría payout a cuenta MP del changador

6. Ambos se califican
```

### Pasar a producción

1. Reemplazar credenciales TEST- por las de **producción** en el panel de MP
2. Cambiar `SERVER_URL` a la URL real del servidor
3. Implementar el payout real al changador usando [Disbursements API](https://www.mercadopago.com.ar/developers/es/docs/marketplace/integration-configuration/create-marketplace)
4. Configurar `PLATFORM_FEE_PERCENT` y usar MP Marketplace para split de pagos

## Comandos útiles

```bash
# Ver la DB en interfaz gráfica (Prisma Studio)
cd server && npm run db:studio

# Resetear la DB y volver a sembrar
cd server && npm run db:reset

# Build de producción del frontend
cd client && npm run build
```

## Variables de entorno del servidor

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | `postgresql://user:pass@localhost:5432/michanga` |
| `JWT_SECRET` | Clave secreta para los tokens JWT | `mi_super_secreto_123` |
| `PORT` | Puerto del servidor | `4000` |
| `CLIENT_URL` | URL del frontend (para CORS) | `http://localhost:5173` |

---

Hecho con ❤️ en Buenos Aires 🇦🇷
