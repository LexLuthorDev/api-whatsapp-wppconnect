require("dotenv").config();

// errorHandlerPlugin.js

// Classe de erro personalizada para erros de API
class ApiError extends Error {
    constructor(status, message) {
        super(message);
        this.status = status;
    }
}

// Middleware de gerenciamento de erros
const errorHandlerPlugin = (err, req, res, next) => {
    // Captura o status do erro ou define como 500
    const status = err.status || 500;

    // Registra o erro no console ou em um sistema de logs
    console.error({
        status: status,
        message: err.message || 'Erro interno do servidor',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined, // Inclui stack trace no modo de desenvolvimento
        timestamp: new Date().toISOString(),
        path: req.originalUrl,
    });

    // Responde com JSON
    res.status(status).json({
        status: status,
        message: err.message || 'Erro interno do servidor',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }) // Inclui stack trace se estiver em desenvolvimento
    });
};

// Exporta o middleware e a classe de erro
module.exports = { errorHandlerPlugin, ApiError };
