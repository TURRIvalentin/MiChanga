const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const tareaInclude = {
  contratante: {
    select: {
      id: true,
      nombre: true,
      foto: true,
      zona: true,
      calificacionProm: true,
      totalCalificaciones: true,
      changasRealizadas: true,
    },
  },
  _count: { select: { postulaciones: true } },
};

exports.getMisTareas = async (req, res) => {
  try {
    const tareas = await prisma.tarea.findMany({
      where: { contratanteId: req.userId },
      include: {
        ...tareaInclude,
        postulaciones: {
          include: {
            changador: {
              select: { id: true, nombre: true, foto: true, calificacionProm: true },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tareas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener tus changas.' });
  }
};

exports.getTareas = async (req, res) => {
  const { categoria, zona, presupuestoMin, presupuestoMax, estado, q, page = 1, limit = 12 } = req.query;

  const where = {};
  if (estado) where.estado = estado;
  else where.estado = 'ABIERTA';
  if (categoria) where.categoria = categoria;
  if (zona) where.zona = { contains: zona, mode: 'insensitive' };
  if (q) {
    where.OR = [
      { titulo: { contains: q, mode: 'insensitive' } },
      { descripcion: { contains: q, mode: 'insensitive' } },
    ];
  }
  if (presupuestoMin || presupuestoMax) {
    where.presupuesto = {};
    if (presupuestoMin) where.presupuesto.gte = parseFloat(presupuestoMin);
    if (presupuestoMax) where.presupuesto.lte = parseFloat(presupuestoMax);
  }

  try {
    const [tareas, total] = await Promise.all([
      prisma.tarea.findMany({
        where,
        include: tareaInclude,
        orderBy: { createdAt: 'desc' },
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
      }),
      prisma.tarea.count({ where }),
    ]);

    res.json({ tareas, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener las changas.' });
  }
};

exports.getTarea = async (req, res) => {
  try {
    const tarea = await prisma.tarea.findUnique({
      where: { id: req.params.id },
      include: {
        ...tareaInclude,
        postulaciones: {
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
        },
      },
    });

    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    res.json(tarea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener la changa.' });
  }
};

exports.createTarea = async (req, res) => {
  const { titulo, descripcion, categoria, zona, presupuesto, esAConvenir, fotos, fechaLimite } = req.body;

  if (!titulo || !descripcion || !categoria || !zona) {
    return res.status(400).json({ error: 'Faltan campos obligatorios.' });
  }

  try {
    const tarea = await prisma.tarea.create({
      data: {
        titulo,
        descripcion,
        categoria,
        zona,
        presupuesto: presupuesto ? parseFloat(presupuesto) : null,
        esAConvenir: esAConvenir || false,
        fotos: fotos || [],
        fechaLimite: fechaLimite ? new Date(fechaLimite) : null,
        contratanteId: req.userId,
      },
      include: tareaInclude,
    });

    res.status(201).json(tarea);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al publicar la changa.' });
  }
};

exports.updateTarea = async (req, res) => {
  try {
    const tarea = await prisma.tarea.findUnique({ where: { id: req.params.id } });
    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el dueño puede editar esta changa.' });
    }

    const { titulo, descripcion, categoria, zona, presupuesto, esAConvenir, fotos, fechaLimite } = req.body;
    const updated = await prisma.tarea.update({
      where: { id: req.params.id },
      data: {
        ...(titulo && { titulo }),
        ...(descripcion && { descripcion }),
        ...(categoria && { categoria }),
        ...(zona && { zona }),
        ...(presupuesto !== undefined && { presupuesto: presupuesto ? parseFloat(presupuesto) : null }),
        ...(esAConvenir !== undefined && { esAConvenir }),
        ...(fotos && { fotos }),
        ...(fechaLimite !== undefined && { fechaLimite: fechaLimite ? new Date(fechaLimite) : null }),
      },
      include: tareaInclude,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar la changa.' });
  }
};

exports.deleteTarea = async (req, res) => {
  try {
    const tarea = await prisma.tarea.findUnique({ where: { id: req.params.id } });
    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el dueño puede eliminar esta changa.' });
    }

    await prisma.tarea.delete({ where: { id: req.params.id } });
    res.json({ message: 'Changa eliminada.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar la changa.' });
  }
};

exports.updateEstado = async (req, res) => {
  const { estado } = req.body;
  const validStates = ['ABIERTA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA'];

  if (!validStates.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido.' });
  }

  try {
    const tarea = await prisma.tarea.findUnique({ where: { id: req.params.id } });
    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el dueño puede cambiar el estado.' });
    }

    const updated = await prisma.tarea.update({
      where: { id: req.params.id },
      data: { estado },
      include: tareaInclude,
    });

    if (estado === 'COMPLETADA') {
      const postulacionAceptada = await prisma.postulacion.findFirst({
        where: { tareaId: req.params.id, estado: 'ACEPTADA' },
      });
      if (postulacionAceptada) {
        await prisma.user.update({
          where: { id: postulacionAceptada.changadorId },
          data: { changasRealizadas: { increment: 1 } },
        });
        req.io.to(`user_${postulacionAceptada.changadorId}`).emit('tarea_completada', {
          tareaId: updated.id,
          titulo: updated.titulo,
        });
      }

      // Auto-liberar pago retenido al completar la changa
      const pago = await prisma.pago.findUnique({ where: { tareaId: req.params.id } });
      if (pago && pago.estado === 'RETENIDO') {
        await prisma.pago.update({
          where: { id: pago.id },
          data: { estado: 'LIBERADO', fechaLiberacion: new Date() },
        });
        const payload = { tareaId: req.params.id, estado: 'LIBERADO', monto: pago.monto, tituloTarea: updated.titulo };
        req.io.to(`user_${pago.receptorId}`).emit('pago_liberado', payload);
        req.io.to(`user_${pago.pagadorId}`).emit('pago_liberado', payload);
        req.io.to(`chat_${req.params.id}`).emit('estado_pago_actualizado', payload);
      }
    }

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el estado.' });
  }
};

// POST /api/tareas/:id/acordar-precio
exports.acordarPrecio = async (req, res) => {
  const { monto, accion } = req.body; // accion: 'proponer' | 'aceptar' | 'rechazar'

  if (!accion) return res.status(400).json({ error: 'Falta la acción.' });

  try {
    const tarea = await prisma.tarea.findUnique({
      where: { id: req.params.id },
      include: {
        postulaciones: { where: { estado: 'ACEPTADA' }, take: 1 },
      },
    });

    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.estado !== 'EN_CURSO') {
      return res.status(400).json({ error: 'Solo se puede acordar precio cuando la changa está en curso.' });
    }

    const postulacionAceptada = tarea.postulaciones[0];
    if (!postulacionAceptada) return res.status(400).json({ error: 'No hay changador aceptado.' });

    const esContratante = req.userId === tarea.contratanteId;
    const esChangador = req.userId === postulacionAceptada.changadorId;
    if (!esContratante && !esChangador) {
      return res.status(403).json({ error: 'No sos participante de esta changa.' });
    }

    if (accion === 'proponer') {
      if (!monto || parseFloat(monto) <= 0) {
        return res.status(400).json({ error: 'El monto debe ser mayor a 0.' });
      }
      const updated = await prisma.tarea.update({
        where: { id: req.params.id },
        data: {
          precioAcordadoPropuesto: parseFloat(monto),
          precioAcordadoPropuestoPorId: req.userId,
          precioAcordado: null, // resetear si ya había uno
        },
      });
      req.io.to(`chat_${tarea.id}`).emit('precio_propuesto', {
        monto: parseFloat(monto),
        propuestoPorId: req.userId,
      });
      return res.json(updated);
    }

    if (accion === 'aceptar') {
      if (!tarea.precioAcordadoPropuesto) {
        return res.status(400).json({ error: 'No hay ninguna propuesta pendiente.' });
      }
      if (tarea.precioAcordadoPropuestoPorId === req.userId) {
        return res.status(400).json({ error: 'No podés aceptar tu propia propuesta.' });
      }
      const updated = await prisma.tarea.update({
        where: { id: req.params.id },
        data: {
          precioAcordado: tarea.precioAcordadoPropuesto,
          precioAcordadoPropuesto: null,
          precioAcordadoPropuestoPorId: null,
        },
      });
      const payload = { monto: updated.precioAcordado };
      req.io.to(`chat_${tarea.id}`).emit('precio_acordado', payload);
      req.io.to(`user_${tarea.contratanteId}`).emit('listo_para_pagar', {
        tareaId: tarea.id,
        monto: updated.precioAcordado,
      });
      return res.json(updated);
    }

    if (accion === 'rechazar') {
      const updated = await prisma.tarea.update({
        where: { id: req.params.id },
        data: { precioAcordadoPropuesto: null, precioAcordadoPropuestoPorId: null },
      });
      req.io.to(`chat_${tarea.id}`).emit('precio_rechazado', { porId: req.userId });
      return res.json(updated);
    }

    res.status(400).json({ error: 'Acción inválida. Usá "proponer", "aceptar" o "rechazar".' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al procesar el precio.' });
  }
};
