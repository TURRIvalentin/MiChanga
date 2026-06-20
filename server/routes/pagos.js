const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  crearPreferencia,
  webhook,
  confirmarRetorno,
  getPagoByTarea,
  getMisPagos,
  liberarPago,
  reembolsarPago,
} = require('../controllers/pagoController');

// Webhook de MercadoPago — sin auth, llamado directamente por MP
router.post('/webhook', webhook);

// Confirmación desde la URL de retorno — requiere auth para evitar spoofing de estado
router.get('/confirmar-retorno', authMiddleware, confirmarRetorno);

router.post('/crear-preferencia', authMiddleware, crearPreferencia);
router.get('/mis-pagos', authMiddleware, getMisPagos);
router.get('/tarea/:tareaId', authMiddleware, getPagoByTarea);
router.post('/liberar/:pagoId', authMiddleware, liberarPago);
router.post('/reembolsar/:pagoId', authMiddleware, reembolsarPago);

module.exports = router;
