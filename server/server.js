require('dotenv').config();

if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET no está configurado. Agregalo en server/.env antes de arrancar.');
  process.exit(1);
}

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const tareaRoutes = require('./routes/tareas');
const postulacionRoutes = require('./routes/postulaciones');
const mensajeRoutes = require('./routes/mensajes');
const calificacionRoutes = require('./routes/calificaciones');
const pagosRoutes = require('./routes/pagos');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Exportar io para que el webhook (sin req) pueda usarlo
exports.getIO = () => io;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inyectar io en req para usarlo en los controladores
app.use((req, _res, next) => {
  req.io = io;
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/tareas', tareaRoutes);
app.use('/api/postulaciones', postulacionRoutes);
app.use('/api/mensajes', mensajeRoutes);
app.use('/api/calificaciones', calificacionRoutes);
app.use('/api/pagos', pagosRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', mensaje: '¡MiChanga está andando!' }));

// Socket.io
io.on('connection', (socket) => {
  socket.on('join_user', (userId) => {
    socket.join(`user_${userId}`);
  });
  socket.on('join_chat', (tareaId) => {
    socket.join(`chat_${tareaId}`);
  });
  socket.on('leave_chat', (tareaId) => {
    socket.leave(`chat_${tareaId}`);
  });
  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor MiChanga corriendo en http://localhost:${PORT}`);
});
