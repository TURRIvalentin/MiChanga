const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createCalificacion = async (req, res) => {
  const { tareaId, destinatarioId, puntaje, comentario } = req.body;

  if (!tareaId || !destinatarioId || !puntaje) {
    return res.status(400).json({ error: 'Faltan datos para calificar.' });
  }
  if (puntaje < 1 || puntaje > 5) {
    return res.status(400).json({ error: 'El puntaje debe ser entre 1 y 5.' });
  }
  if (req.userId === destinatarioId) {
    return res.status(400).json({ error: 'No podés calificarte a vos mismo.' });
  }

  try {
    const tarea = await prisma.tarea.findUnique({ where: { id: tareaId } });
    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.estado !== 'COMPLETADA') {
      return res.status(400).json({ error: 'Solo podés calificar cuando la changa está completada.' });
    }

    // Verificar que el autor sea parte de la tarea
    const esParte =
      tarea.contratanteId === req.userId ||
      !!(await prisma.postulacion.findFirst({
        where: { tareaId, changadorId: req.userId, estado: 'ACEPTADA' },
      }));

    if (!esParte) {
      return res.status(403).json({ error: 'No sos parte de esta changa.' });
    }

    const existing = await prisma.calificacion.findUnique({
      where: { autorId_tareaId: { autorId: req.userId, tareaId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Ya calificaste en esta changa.' });
    }

    const calificacion = await prisma.calificacion.create({
      data: {
        tareaId,
        autorId: req.userId,
        destinatarioId,
        puntaje: parseInt(puntaje),
        comentario: comentario || null,
      },
      include: {
        autor: { select: { id: true, nombre: true, foto: true } },
        tarea: { select: { id: true, titulo: true } },
      },
    });

    // Recalcular el promedio del destinatario
    const stats = await prisma.calificacion.aggregate({
      where: { destinatarioId },
      _avg: { puntaje: true },
      _count: { puntaje: true },
    });

    await prisma.user.update({
      where: { id: destinatarioId },
      data: {
        calificacionProm: stats._avg.puntaje || 0,
        totalCalificaciones: stats._count.puntaje,
      },
    });

    res.status(201).json(calificacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al calificar.' });
  }
};

exports.getCalificacionesByUser = async (req, res) => {
  try {
    const calificaciones = await prisma.calificacion.findMany({
      where: { destinatarioId: req.params.userId },
      include: {
        autor: { select: { id: true, nombre: true, foto: true } },
        tarea: { select: { id: true, titulo: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(calificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// GET /api/calificaciones/tarea/:tareaId/ya-califique  (auth required)
exports.getYaCalifique = async (req, res) => {
  try {
    const existing = await prisma.calificacion.findUnique({
      where: { autorId_tareaId: { autorId: req.userId, tareaId: req.params.tareaId } },
    });
    res.json({ yaCalifique: !!existing });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};
