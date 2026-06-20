const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createPostulacion = async (req, res) => {
  const { tareaId, mensaje, precioOfrecido } = req.body;

  if (!tareaId || !mensaje) {
    return res.status(400).json({ error: 'Faltan datos para postularse.' });
  }

  try {
    const tarea = await prisma.tarea.findUnique({ where: { id: tareaId } });
    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.contratanteId === req.userId) {
      return res.status(400).json({ error: 'No podés postularte a tu propia changa.' });
    }
    if (tarea.estado !== 'ABIERTA') {
      return res.status(400).json({ error: 'Esta changa ya no está disponible.' });
    }

    const existing = await prisma.postulacion.findUnique({
      where: { changadorId_tareaId: { changadorId: req.userId, tareaId } },
    });
    if (existing) {
      return res.status(409).json({ error: 'Ya te postulaste a esta changa.' });
    }

    const postulacion = await prisma.postulacion.create({
      data: {
        tareaId,
        changadorId: req.userId,
        mensaje,
        precioOfrecido: precioOfrecido ? parseFloat(precioOfrecido) : null,
      },
      include: {
        changador: {
          select: {
            id: true,
            nombre: true,
            foto: true,
            zona: true,
            calificacionProm: true,
            totalCalificaciones: true,
            changasRealizadas: true,
            descripcion: true,
          },
        },
      },
    });

    // Notificar al contratante en tiempo real
    req.io.to(`user_${tarea.contratanteId}`).emit('nueva_postulacion', {
      tareaId,
      tituloTarea: tarea.titulo,
      changador: postulacion.changador,
    });

    res.status(201).json(postulacion);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al postularse.' });
  }
};

exports.getPostulacionesByTarea = async (req, res) => {
  try {
    const tarea = await prisma.tarea.findUnique({ where: { id: req.params.tareaId } });
    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el dueño puede ver las postulaciones.' });
    }

    const postulaciones = await prisma.postulacion.findMany({
      where: { tareaId: req.params.tareaId },
      include: {
        changador: {
          select: {
            id: true,
            nombre: true,
            foto: true,
            zona: true,
            calificacionProm: true,
            totalCalificaciones: true,
            changasRealizadas: true,
            descripcion: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(postulaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener postulaciones.' });
  }
};

exports.getMisPostulaciones = async (req, res) => {
  try {
    const postulaciones = await prisma.postulacion.findMany({
      where: { changadorId: req.userId },
      include: {
        tarea: {
          include: {
            contratante: {
              select: { id: true, nombre: true, foto: true, zona: true, calificacionProm: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(postulaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus postulaciones.' });
  }
};

exports.aceptarPostulacion = async (req, res) => {
  try {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: req.params.id },
      include: { tarea: true },
    });

    if (!postulacion) return res.status(404).json({ error: 'Postulación no encontrada.' });
    if (postulacion.tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'No tenés permiso para aceptar esta postulación.' });
    }
    if (postulacion.tarea.estado !== 'ABIERTA') {
      return res.status(400).json({ error: 'Solo se pueden aceptar postulaciones en changas abiertas.' });
    }

    // Aceptar esta y rechazar las demás
    await prisma.$transaction([
      prisma.postulacion.update({
        where: { id: req.params.id },
        data: { estado: 'ACEPTADA' },
      }),
      prisma.postulacion.updateMany({
        where: { tareaId: postulacion.tareaId, id: { not: req.params.id } },
        data: { estado: 'RECHAZADA' },
      }),
      prisma.tarea.update({
        where: { id: postulacion.tareaId },
        data: { estado: 'EN_CURSO' },
      }),
    ]);

    // Notificar al changador aceptado
    req.io.to(`user_${postulacion.changadorId}`).emit('postulacion_aceptada', {
      tareaId: postulacion.tareaId,
      tituloTarea: postulacion.tarea.titulo,
    });

    const updated = await prisma.postulacion.findUnique({
      where: { id: req.params.id },
      include: {
        changador: {
          select: { id: true, nombre: true, foto: true, zona: true, calificacionProm: true },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al aceptar la postulación.' });
  }
};

exports.rechazarPostulacion = async (req, res) => {
  try {
    const postulacion = await prisma.postulacion.findUnique({
      where: { id: req.params.id },
      include: { tarea: true },
    });

    if (!postulacion) return res.status(404).json({ error: 'Postulación no encontrada.' });
    if (postulacion.tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'No tenés permiso.' });
    }

    const updated = await prisma.postulacion.update({
      where: { id: req.params.id },
      data: { estado: 'RECHAZADA' },
    });

    req.io.to(`user_${postulacion.changadorId}`).emit('postulacion_rechazada', {
      tareaId: postulacion.tareaId,
      tituloTarea: postulacion.tarea.titulo,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al rechazar la postulación.' });
  }
};
