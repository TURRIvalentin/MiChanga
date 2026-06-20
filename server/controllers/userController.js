const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

exports.getUser = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        nombre: true,
        foto: true,
        descripcion: true,
        zona: true,
        calificacionProm: true,
        totalCalificaciones: true,
        changasRealizadas: true,
        esChangador: true,
        esContratante: true,
        createdAt: true,
        tareasPublicadas: {
          where: { estado: { not: 'CANCELADA' } },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            titulo: true,
            categoria: true,
            estado: true,
            zona: true,
            presupuesto: true,
            esAConvenir: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

exports.updateUser = async (req, res) => {
  if (req.userId !== req.params.id) {
    return res.status(403).json({ error: 'No podés editar el perfil de otro usuario.' });
  }

  const { nombre, descripcion, zona, telefono, foto, esChangador, esContratante, password } = req.body;

  try {
    const data = {};
    if (nombre) data.nombre = nombre;
    if (descripcion !== undefined) data.descripcion = descripcion;
    if (zona !== undefined) data.zona = zona;
    if (telefono !== undefined) data.telefono = telefono;
    if (foto !== undefined) data.foto = foto;
    if (esChangador !== undefined) data.esChangador = esChangador;
    if (esContratante !== undefined) data.esContratante = esContratante;
    if (password) data.password = await bcrypt.hash(password, 10);

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data,
    });

    const { password: _pw, ...safeUser } = updated;
    res.json(safeUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar el perfil.' });
  }
};

exports.getUserCalificaciones = async (req, res) => {
  try {
    const calificaciones = await prisma.calificacion.findMany({
      where: { destinatarioId: req.params.id },
      include: {
        autor: {
          select: { id: true, nombre: true, foto: true },
        },
        tarea: {
          select: { id: true, titulo: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(calificaciones);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};
