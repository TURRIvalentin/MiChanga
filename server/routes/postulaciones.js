const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  createPostulacion,
  getPostulacionesByTarea,
  getMisPostulaciones,
  aceptarPostulacion,
  rechazarPostulacion,
} = require('../controllers/postulacionController');

router.post('/', authMiddleware, createPostulacion);
router.get('/mis-postulaciones', authMiddleware, getMisPostulaciones);
router.get('/tarea/:tareaId', authMiddleware, getPostulacionesByTarea);
router.patch('/:id/aceptar', authMiddleware, aceptarPostulacion);
router.patch('/:id/rechazar', authMiddleware, rechazarPostulacion);

module.exports = router;
