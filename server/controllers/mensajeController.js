const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const isParticipant = async (tareaId, userId) => {
  const tarea = await prisma.tarea.findUnique({ where: { id: tareaId } });
  if (!tarea) return false;
  if (tarea.contratanteId === userId) return true;

  const postulacion = await prisma.postulacion.findFirst({
    where: { tareaId, changadorId: userId, estado: 'ACEPTADA' },
  });
  return !!postulacion;
};

exports.getMensajes = async (req, res) => {
  try {
    const allowed = await isParticipant(req.params.tareaId, req.userId);
    if (!allowed) {
      return res.status(403).json({ error: 'No tenés acceso a este chat.' });
    }

    const mensajes = await prisma.mensaje.findMany({
      where: { tareaId: req.params.tareaId },
      include: {
        emisor: { select: { id: true, nombre: true, foto: true } },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(mensajes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mensajes.' });
  }
};

exports.sendMensaje = async (req, res) => {
  const { tareaId, contenido } = req.body;

  if (!tareaId || !contenido?.trim()) {
    return res.status(400).json({ error: 'Faltan datos para enviar el mensaje.' });
  }
  if (contenido.trim().length > 2000) {
    return res.status(400).json({ error: 'El mensaje no puede superar los 2000 caracteres.' });
  }

  try {
    const allowed = await isParticipant(tareaId, req.userId);
    if (!allowed) {
      return res.status(403).json({ error: 'No tenés acceso a este chat.' });
    }

    const mensaje = await prisma.mensaje.create({
      data: { tareaId, emisorId: req.userId, contenido: contenido.trim() },
      include: {
        emisor: { select: { id: true, nombre: true, foto: true } },
      },
    });

    // Emitir en tiempo real a todos en la sala del chat
    req.io.to(`chat_${tareaId}`).emit('nuevo_mensaje', mensaje);

    res.status(201).json(mensaje);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al enviar el mensaje.' });
  }
};
