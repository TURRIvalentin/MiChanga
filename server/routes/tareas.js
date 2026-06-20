const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  getTareas,
  getMisTareas,
  getTarea,
  createTarea,
  updateTarea,
  deleteTarea,
  updateEstado,
  acordarPrecio,
} = require('../controllers/tareaController');

router.get('/', getTareas);
router.get('/mis-tareas', authMiddleware, getMisTareas);
router.get('/:id', getTarea);
router.post('/', authMiddleware, createTarea);
router.put('/:id', authMiddleware, updateTarea);
router.delete('/:id', authMiddleware, deleteTarea);
router.patch('/:id/estado', authMiddleware, updateEstado);
router.post('/:id/acordar-precio', authMiddleware, acordarPrecio);

module.exports = router;
