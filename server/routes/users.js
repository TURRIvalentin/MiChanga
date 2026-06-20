const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getUser, updateUser, getUserCalificaciones } = require('../controllers/userController');

router.get('/:id', getUser);
router.put('/:id', authMiddleware, updateUser);
router.get('/:id/calificaciones', getUserCalificaciones);

module.exports = router;
