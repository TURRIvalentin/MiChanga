<div align="center">

# 🤝 MiChanga

**El marketplace de changas en Argentina**

Conectamos personas que necesitan una mano con changadores de confianza, barrio a barrio.<br/>
Publicá tu changa, postulate, acordá el precio en el chat y listo.

[![Ver la app en vivo](https://img.shields.io/badge/🚀%20Ver%20la%20app-en%20vivo-4F46E5?style=for-the-badge)](https://mi-changa.vercel.app)

![React](https://img.shields.io/badge/React_18-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=flat&logo=socketdotio&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)

</div>

---

## ¿Qué es MiChanga?

MiChanga es una plataforma que conecta a personas que necesitan ayuda con trabajos del día a día — **changas** — con personas dispuestas a hacerlos. Todo dentro del mismo barrio, con chat en tiempo real y sistema de calificaciones para que puedas confiar en quien contratás.

**Casos de uso:**
- 🚛 Necesitás alguien con camioneta para una mudanza
- 🧹 Buscás limpieza para el hogar o la oficina
- 💻 Precisás ayuda con computadoras o internet
- 🏠 Querés un plomero, electricista o pintor
- 🛒 Necesitás mandados o trámites

---

## ✨ Funcionalidades

| | Feature | Descripción |
|---|---|---|
| 🔐 | **Autenticación completa** | Registro, login y perfil con foto |
| 📋 | **Publicar changas** | Título, descripción, categoría, zona y presupuesto |
| 🔍 | **Explorar y filtrar** | Búsqueda por categoría, zona y texto libre |
| 📨 | **Postularse** | Changadores se postulan con un mensaje |
| 💬 | **Chat en tiempo real** | Mensajería instantánea vía Socket.io |
| 💰 | **Acordar precio** | Sistema de propuesta y aceptación de precio en el chat |
| ✅ | **Cerrar la changa** | El contratante marca la changa como completada |
| ⭐ | **Calificaciones** | Ambas partes se califican al finalizar |
| 🔔 | **Notificaciones** | Alertas en tiempo real (nueva postulación, aceptación, etc.) |
| 💳 | **Pagos (próximamente)** | Integración con MercadoPago Checkout Pro (código listo, activable con un flag) |

---

## 🛠️ Stack tecnológico

```
Frontend          Backend           Infraestructura
─────────         ───────────       ───────────────
React 18          Node.js           Railway (deploy)
Vite              Express           Neon (PostgreSQL)
Tailwind CSS      Prisma ORM        GitHub (CI/CD)
Socket.io-client  Socket.io
React Router 6    JWT Auth
Axios             bcryptjs
                  express-validator
```

---

## 🚀 Correr localmente

### Prerrequisitos

- Node.js v18+
- PostgreSQL v14+ corriendo localmente

### 1. Clonar e instalar

```bash
git clone https://github.com/TURRIvalentin/MiChanga.git
cd MiChanga

# Instalar dependencias del backend
cd server && npm install

# Instalar dependencias del frontend
cd ../client && npm install
```

### 2. Configurar el servidor

```bash
cd server
cp .env.example .env
```

Editar `server/.env`:

```env
DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/michanga"
JWT_SECRET="un_string_largo_y_aleatorio_de_al_menos_32_caracteres"
PORT=4000
CLIENT_URL="http://localhost:5173"
```

### 3. Crear la base de datos y aplicar migraciones

```bash
# En PostgreSQL
psql -U postgres -c "CREATE DATABASE michanga;"

# Migrar y sembrar datos de prueba
cd server
npm run db:migrate
npm run db:seed
```

### 4. Levantar los servicios

```bash
# Terminal 1 — Backend (http://localhost:4000)
cd server && npm run dev

# Terminal 2 — Frontend (http://localhost:5173)
cd client && npm run dev
```

### Usuarios de prueba

| Email | Contraseña | Rol |
|---|---|---|
| juan@example.com | password123 | Contratante |
| maria@example.com | password123 | Changadora |
| carlos@example.com | password123 | Changador (mudanzas) |
| ana@example.com | password123 | Changadora (tecnología) |
| laura@example.com | password123 | Changadora (cuidados) |
| roberto@example.com | password123 | Changador / Contratante |

---

## 🗺️ Roadmap

- [x] Autenticación y perfiles
- [x] Publicación y exploración de changas
- [x] Postulaciones
- [x] Chat en tiempo real
- [x] Acuerdo de precio en el chat
- [x] Calificaciones mutuas
- [x] Notificaciones en tiempo real
- [ ] Pagos con MercadoPago *(código implementado, pendiente de activar)*
- [ ] Fotos en publicaciones
- [ ] App mobile (React Native)
- [ ] Búsqueda por geolocalización

---

## 📡 API REST

<details>
<summary>Ver endpoints</summary>

### Autenticación
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Usuario actual |

### Changas
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/tareas` | Listar (con filtros) |
| GET | `/api/tareas/:id` | Detalle |
| POST | `/api/tareas` | Publicar |
| PATCH | `/api/tareas/:id/estado` | Cambiar estado |
| POST | `/api/tareas/:id/acordar-precio` | Proponer / aceptar precio |

### Postulaciones
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/postulaciones` | Postularse |
| GET | `/api/postulaciones/mis-postulaciones` | Mis postulaciones |
| PATCH | `/api/postulaciones/:id/aceptar` | Aceptar |
| PATCH | `/api/postulaciones/:id/rechazar` | Rechazar |

### Mensajes
| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/mensajes/tarea/:tareaId` | Historial del chat |
| POST | `/api/mensajes` | Enviar mensaje |

### Calificaciones
| Método | Endpoint | Descripción |
|---|---|---|
| POST | `/api/calificaciones` | Calificar usuario |
| GET | `/api/calificaciones/usuario/:id` | Ver calificaciones de alguien |
| GET | `/api/calificaciones/tarea/:tareaId/ya-califique` | Verificar si ya califiqué |

</details>

---

## ⚡ Eventos Socket.io

| Evento | Descripción |
|---|---|
| `nueva_postulacion` | Alguien se postuló a tu changa |
| `postulacion_aceptada` | Tu postulación fue aceptada |
| `tarea_completada` | La changa fue marcada como completada |
| `nuevo_mensaje` | Nuevo mensaje en el chat |
| `precio_propuesto` | Alguien propuso un precio |
| `precio_acordado` | Precio aceptado por ambas partes |

---

<div align="center">

Hecho con ❤️ en Buenos Aires 🇦🇷

</div>
