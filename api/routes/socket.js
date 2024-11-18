const express = require('express');
const router = express.Router();
const socketController = require('../controllers/socketController');

// Rota para testar o envio de mensagens via WebSocket
router.post('/test-socket', socketController.testSocket);

module.exports = router;
