const { PrismaClient } = require('@prisma/client');
const { MercadoPagoConfig, Preference, Payment, Refund } = require('mercadopago');

const prisma = new PrismaClient();

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '0');

function getMPClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: { timeout: 5000 },
  });
}

// POST /api/pagos/crear-preferencia
exports.crearPreferencia = async (req, res) => {
  const { tareaId } = req.body;

  if (!tareaId) return res.status(400).json({ error: 'Falta el ID de la changa.' });

  try {
    const tarea = await prisma.tarea.findUnique({
      where: { id: tareaId },
      include: {
        contratante: true,
        postulaciones: {
          where: { estado: 'ACEPTADA' },
          include: { changador: true },
          take: 1,
        },
        pago: true,
      },
    });

    if (!tarea) return res.status(404).json({ error: 'Changa no encontrada.' });
    if (tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el contratante puede iniciar el pago.' });
    }
    if (!tarea.precioAcordado) {
      return res.status(400).json({ error: 'Primero deben acordar el precio en el chat.' });
    }
    if (tarea.estado !== 'EN_CURSO') {
      return res.status(400).json({ error: 'La changa debe estar en curso para pagar.' });
    }
    if (tarea.pago && ['RETENIDO', 'LIBERADO'].includes(tarea.pago.estado)) {
      return res.status(409).json({ error: 'Esta changa ya tiene un pago registrado.', pago: tarea.pago });
    }

    const postulacionAceptada = tarea.postulaciones[0];
    if (!postulacionAceptada) {
      return res.status(400).json({ error: 'No hay changador aceptado.' });
    }

    const monto = tarea.precioAcordado;
    const externalReference = `tarea_${tarea.id}`;

    const mpClient = getMPClient();
    const preferenceClient = new Preference(mpClient);

    const preferenceData = {
      items: [
        {
          id: tarea.id,
          title: `MiChanga: ${tarea.titulo}`,
          description: tarea.descripcion.substring(0, 255),
          quantity: 1,
          unit_price: monto,
          currency_id: 'ARS',
        },
      ],
      payer: {
        email: tarea.contratante.email,
        name: tarea.contratante.nombre,
      },
      back_urls: {
        success: `${process.env.CLIENT_URL}/pago/exitoso`,
        failure: `${process.env.CLIENT_URL}/pago/fallido`,
        pending: `${process.env.CLIENT_URL}/pago/pendiente`,
      },
      auto_return: 'approved',
      external_reference: externalReference,
      notification_url: `${process.env.SERVER_URL}/api/pagos/webhook`,
      statement_descriptor: 'MiChanga',
      metadata: {
        tareaId: tarea.id,
        contratanteId: tarea.contratanteId,
        changadorId: postulacionAceptada.changadorId,
      },
    };

    const preference = await preferenceClient.create({ body: preferenceData });

    // Crear o actualizar el registro de pago
    const pagoData = {
      monto,
      estado: 'PENDIENTE',
      mercadoPagoPreferenceId: preference.id,
      externalReference,
      tareaId: tarea.id,
      pagadorId: tarea.contratanteId,
      receptorId: postulacionAceptada.changadorId,
    };

    const pago = tarea.pago
      ? await prisma.pago.update({ where: { tareaId: tarea.id }, data: pagoData })
      : await prisma.pago.create({ data: pagoData });

    res.json({
      initPoint: preference.init_point,
      sandboxInitPoint: preference.sandbox_init_point,
      preferenceId: preference.id,
      pago,
    });
  } catch (err) {
    console.error('Error MP crear preferencia:', err);
    res.status(500).json({ error: 'Error al crear la preferencia de pago. Revisá tu MP_ACCESS_TOKEN.' });
  }
};

// POST /api/pagos/webhook  (sin autenticación — llamado por MercadoPago)
exports.webhook = async (req, res) => {
  // Responder 200 de inmediato para que MP no reintente
  res.sendStatus(200);

  try {
    const type = req.query.type || req.body?.type;
    const dataId = req.query['data.id'] || req.body?.data?.id;

    if (type !== 'payment' || !dataId) return;

    const mpClient = getMPClient();
    const paymentClient = new Payment(mpClient);
    const payment = await paymentClient.get({ id: dataId });

    const externalRef = payment.external_reference;
    if (!externalRef?.startsWith('tarea_')) return;

    const pago = await prisma.pago.findUnique({ where: { externalReference: externalRef } });
    if (!pago) return;

    const estadoMap = {
      approved: 'RETENIDO',
      rejected: 'FALLIDO',
      cancelled: 'FALLIDO',
      in_process: 'PROCESANDO',
      pending: 'PROCESANDO',
      refunded: 'REEMBOLSADO',
      charged_back: 'REEMBOLSADO',
    };

    const nuevoEstado = estadoMap[payment.status];
    if (!nuevoEstado || nuevoEstado === pago.estado) return;

    await prisma.pago.update({
      where: { id: pago.id },
      data: {
        estado: nuevoEstado,
        mercadoPagoPaymentId: String(payment.id),
      },
    });

    // Notificar en tiempo real
    const tarea = await prisma.tarea.findUnique({
      where: { id: pago.tareaId },
      select: { contratanteId: true, titulo: true },
    });
    if (!tarea) return;

    // Importar io desde server si fuera necesario — lo haremos via req.io en rutas
    // Acá no tenemos req.io, pero podemos importar el singleton
    const { getIO } = require('../server');
    const io = getIO();
    if (io) {
      const payload = { tareaId: pago.tareaId, tituloTarea: tarea.titulo, estado: nuevoEstado, monto: pago.monto };
      io.to(`user_${pago.pagadorId}`).emit('estado_pago_actualizado', payload);
      io.to(`user_${pago.receptorId}`).emit('estado_pago_actualizado', payload);
      io.to(`chat_${pago.tareaId}`).emit('estado_pago_actualizado', payload);
    }
  } catch (err) {
    console.error('Error webhook MP:', err?.message);
  }
};

// GET /api/pagos/confirmar-retorno  (called from frontend return URL)
exports.confirmarRetorno = async (req, res) => {
  const { payment_id, status, external_reference } = req.query;

  if (!payment_id || !external_reference) {
    return res.status(400).json({ error: 'Parámetros faltantes.' });
  }

  try {
    const pago = await prisma.pago.findUnique({
      where: { externalReference: external_reference },
      include: {
        tarea: { select: { id: true, titulo: true, contratanteId: true } },
      },
    });

    if (!pago) return res.status(404).json({ error: 'Pago no encontrado.' });
    if (pago.pagadorId !== req.userId) {
      return res.status(403).json({ error: 'No tenés permiso para confirmar este pago.' });
    }

    const estadoMap = {
      approved: 'RETENIDO',
      rejected: 'FALLIDO',
      cancelled: 'FALLIDO',
      pending: 'PROCESANDO',
      in_process: 'PROCESANDO',
    };

    const nuevoEstado = estadoMap[status];
    if (nuevoEstado && nuevoEstado !== pago.estado) {
      await prisma.pago.update({
        where: { id: pago.id },
        data: { estado: nuevoEstado, mercadoPagoPaymentId: payment_id },
      });

      const io = req.io;
      if (io) {
        const payload = { tareaId: pago.tareaId, estado: nuevoEstado, monto: pago.monto };
        io.to(`chat_${pago.tareaId}`).emit('estado_pago_actualizado', payload);
        io.to(`user_${pago.pagadorId}`).emit('estado_pago_actualizado', payload);
        io.to(`user_${pago.receptorId}`).emit('estado_pago_actualizado', payload);
      }
    }

    const pagoActualizado = await prisma.pago.findUnique({ where: { id: pago.id } });
    res.json({ pago: pagoActualizado });
  } catch (err) {
    console.error('Error confirmar retorno:', err);
    res.status(500).json({ error: 'Error al confirmar el pago.' });
  }
};

// GET /api/pagos/tarea/:tareaId
exports.getPagoByTarea = async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { tareaId: req.params.tareaId },
      include: {
        pagador: { select: { id: true, nombre: true, foto: true } },
        receptor: { select: { id: true, nombre: true, foto: true } },
      },
    });
    if (!pago) return res.status(404).json({ error: 'No hay pago para esta changa.' });

    // Solo los participantes pueden ver el pago
    const tarea = await prisma.tarea.findUnique({ where: { id: req.params.tareaId } });
    const postulacionAceptada = await prisma.postulacion.findFirst({
      where: { tareaId: req.params.tareaId, estado: 'ACEPTADA' },
    });
    const esParte = tarea?.contratanteId === req.userId || postulacionAceptada?.changadorId === req.userId;
    if (!esParte) return res.status(403).json({ error: 'No tenés acceso a este pago.' });

    res.json(pago);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// GET /api/pagos/mis-pagos
exports.getMisPagos = async (req, res) => {
  try {
    const [realizados, recibidos] = await Promise.all([
      prisma.pago.findMany({
        where: { pagadorId: req.userId },
        include: {
          tarea: { select: { id: true, titulo: true, categoria: true, zona: true } },
          receptor: { select: { id: true, nombre: true, foto: true } },
        },
        orderBy: { fechaCreacion: 'desc' },
      }),
      prisma.pago.findMany({
        where: { receptorId: req.userId },
        include: {
          tarea: { select: { id: true, titulo: true, categoria: true, zona: true } },
          pagador: { select: { id: true, nombre: true, foto: true } },
        },
        orderBy: { fechaCreacion: 'desc' },
      }),
    ]);
    res.json({ realizados, recibidos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor.' });
  }
};

// POST /api/pagos/liberar/:pagoId
exports.liberarPago = async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: req.params.pagoId },
      include: { tarea: { select: { id: true, titulo: true, contratanteId: true } } },
    });

    if (!pago) return res.status(404).json({ error: 'Pago no encontrado.' });
    if (pago.tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el contratante puede liberar el pago.' });
    }
    if (pago.estado !== 'RETENIDO') {
      return res.status(400).json({ error: `No se puede liberar un pago en estado "${pago.estado}".` });
    }

    const updated = await prisma.pago.update({
      where: { id: pago.id },
      data: { estado: 'LIBERADO', fechaLiberacion: new Date() },
    });

    // En producción: acá iría el payout/disbursement a la cuenta MP del receptor
    // await mpMarketplace.payout({ receptor: pago.receptorId, monto: pago.monto })

    req.io.to(`user_${pago.receptorId}`).emit('pago_liberado', {
      tareaId: pago.tareaId,
      tituloTarea: pago.tarea.titulo,
      monto: pago.monto,
    });
    req.io.to(`chat_${pago.tareaId}`).emit('estado_pago_actualizado', {
      tareaId: pago.tareaId,
      estado: 'LIBERADO',
      monto: pago.monto,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al liberar el pago.' });
  }
};

// POST /api/pagos/reembolsar/:pagoId
exports.reembolsarPago = async (req, res) => {
  try {
    const pago = await prisma.pago.findUnique({
      where: { id: req.params.pagoId },
      include: { tarea: { select: { id: true, titulo: true, contratanteId: true } } },
    });

    if (!pago) return res.status(404).json({ error: 'Pago no encontrado.' });
    if (pago.tarea.contratanteId !== req.userId) {
      return res.status(403).json({ error: 'Solo el contratante puede solicitar el reembolso.' });
    }
    if (pago.estado !== 'RETENIDO') {
      return res.status(400).json({ error: `No se puede reembolsar un pago en estado "${pago.estado}".` });
    }
    if (!pago.mercadoPagoPaymentId) {
      return res.status(400).json({ error: 'No se encontró el ID de pago en MercadoPago.' });
    }

    // Llamar a la API de reembolso de MP
    const mpClient = getMPClient();
    const refundClient = new Refund(mpClient);
    await refundClient.create({
      payment_id: parseInt(pago.mercadoPagoPaymentId),
      body: {},
    });

    const updated = await prisma.pago.update({
      where: { id: pago.id },
      data: { estado: 'REEMBOLSADO' },
    });

    req.io.to(`user_${pago.pagadorId}`).emit('pago_reembolsado', {
      tareaId: pago.tareaId,
      tituloTarea: pago.tarea.titulo,
      monto: pago.monto,
    });
    req.io.to(`chat_${pago.tareaId}`).emit('estado_pago_actualizado', {
      tareaId: pago.tareaId,
      estado: 'REEMBOLSADO',
      monto: pago.monto,
    });

    res.json(updated);
  } catch (err) {
    console.error('Error reembolso MP:', err);
    res.status(500).json({ error: 'Error al procesar el reembolso. Verificá el estado del pago en MercadoPago.' });
  }
};
