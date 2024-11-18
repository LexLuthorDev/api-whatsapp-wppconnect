const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, max, message) => {
    return rateLimit({
        windowMs: windowMs, // Duração da janela
        max: max, // Limite de requisições por janela
        message: message, // Mensagem de resposta quando o limite é atingido
        standardHeaders: true, // Retornar informações de limite em headers
        legacyHeaders: false, // Desativar headers antigos
        handler: (req, res, next) => {
            // Calcular o tempo restante até que o limite seja reiniciado
            const retryAfter = Math.ceil((req.rateLimit.resetTime - Date.now()) / 1000); // em segundos
            res.set('Retry-After', retryAfter);
            res.status(429).json({
                status: 429,
                error: 'Muitas solicitações',
                message: 'Você excedeu o limite de requisições. Por favor, tente novamente mais tarde.',
                retryAfter: retryAfter // Tempo de espera em segundos
            });
        }
    });
};

const rateLimitPlugin = (app) => {
    // Exemplo de configuração: 100 requisições a cada 15 minutos
    const limiter = createRateLimiter(15 * 60 * 1000, 100, {
        status: 429,
        error: 'Muitas solicitações', 
        message: 'Você excedeu o limite de requisições. Por favor, tente novamente mais tarde.',
    });
    // Usar o limiter em todas as rotas
    app.use(limiter);
};

module.exports = {rateLimitPlugin};
