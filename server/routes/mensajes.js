const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMensajes, sendMensaje } = require('../controllers/mensajeController');

router.get('/tarea/:tareaId', authMiddleware, getMensajes);
router.post('/', authMiddleware, sendMensaje);

module.exports = router;
