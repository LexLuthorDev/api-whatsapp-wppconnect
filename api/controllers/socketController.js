const { getIo, isSocketEnabled } = require('../plugins/socketIo'); // Importa a função para obter a instância do io

// Função para enviar uma mensagem para todos os clientes conectados
const sendMessage = (message) => {
    const io = getIo();
    if (io) {
        io.emit('message', message); // Envia uma mensagem para todos os clientes
    }
};

// Endpoint para testar o envio de mensagens
const testSocket = (req, res) => {
    const message = req.body.message; // Mensagem recebida no corpo da requisição

    if (!isSocketEnabled()) {
        return res.status(500).json({ error: 'Socket.io não está habilitado!' });
    }
    sendMessage(message); // Envia a mensagem para os clientes conectados
    res.json({ status: 'Mensagem enviada!', message });
};

module.exports = {
    testSocket,
};
