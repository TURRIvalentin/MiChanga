const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createCalificacion, getCalificacionesByUser, getYaCalifique } = require('../controllers/calificacionController');

router.post('/', authMiddleware, createCalificacion);
router.get('/tarea/:tareaId/ya-califique', authMiddleware, getYaCalifique);
router.get('/usuario/:userId', getCalificacionesByUser);

module.exports = router;
